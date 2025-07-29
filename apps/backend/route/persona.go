package route

import (
	"image/jpeg"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"jp.co.moneyforward/pf-skillsearch/schema"
	"jp.co.moneyforward/pf-skillsearch/vertex"
)

func SearchPeopleMock(c *gin.Context) {
	results := []schema.PFSkillSearchModelsPayloadSearchPeopleResponse{
		{
			Person: schema.PFSkillSearchModelsPerson{
				EmployeeId:                     "1",
				EmployeeName:                   "山田 太郎",
				Mail:                           "yamada.taro@example.com",
				Age:                            "30",
				Gender:                         "男性",
				JobTitle:                       "エンジニア",
				Dept1:                          "開発部",
				Location:                       "東京",
				EmploymentType:                 "正社員",
				CurrentEmployeeFlag:            "1",
				Birthday:                       "1995-01-01",
				EnteredAt:                      "2020-04-01",
				Dept2:                          "システム開発",
				RecruitmentCategoryNewGraduate: "新卒",
				SalaryTable:                    "A",
				YearsOfService:                 "5",
				JobFamily:                      "IT",
				JpNonJpClassification:          "JP",
				LoadDate:                       "2025-07-28",
			},
			Score: 0.95,
		},
		{
			Person: schema.PFSkillSearchModelsPerson{
				EmployeeId:                     "2",
				EmployeeName:                   "佐藤 花子",
				Mail:                           "sato.hanako@example.com",
				Age:                            "28",
				Gender:                         "女性",
				JobTitle:                       "フロントエンドエンジニア",
				Dept1:                          "Web開発部",
				Dept2:                          "フロントエンド",
				Location:                       "大阪",
				EmploymentType:                 "契約社員",
				CurrentEmployeeFlag:            "1",
				Birthday:                       "1997-03-15",
				EnteredAt:                      "2021-10-01",
				RecruitmentCategoryNewGraduate: "中途",
				SalaryTable:                    "B",
				YearsOfService:                 "3",
				JobFamily:                      "IT",
				JpNonJpClassification:          "JP",
				LoadDate:                       "2025-07-28",
			},
			Score: 0.89,
		},
	}
	c.JSON(http.StatusOK, results)
}

// GET　/api/people
// parameters: query string ?query=username
// returns: 200 OK with search results or 404 Not Found if no results found
func SearchPeople(c *gin.Context) {
	query := c.Param("query")
	// Validate query
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter is required"})
		return
	}

	var apiKey string
	if os.Getenv("AISEARCH_API_KEY") != "" {
		apiKey = os.Getenv("AISEARCH_API_KEY")
	} else {
		apiKey = "" // 認証されたKeyを使用する場合は、ここで取得する必要があります
	}

	client, err := vertex.NewVertexAISearch(apiKey, "us", vertex.DS_EMPLOYEE_INFO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client", "details": err.Error()})
		return
	}
	if client == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client"})
		return
	}
	results, err := client.SearchPeople(query)
	// results, err := client.SearchPeopleMock(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
		return
	}
	if len(results) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No results found"})
		return
	}
	var response []schema.PFSkillSearchModelsPayloadSearchPeopleResponse
	for _, person := range results {
		response = append(response, schema.PFSkillSearchModelsPayloadSearchPeopleResponse{
			Person: person,
			Score:  1.0, // Assuming a score of 1.0
		})
	}

	c.JSON(http.StatusOK, response)
}

func GeneratePersona(c *gin.Context) {
	var person schema.PFSkillSearchModelsPerson
	if err := c.ShouldBindJSON(&person); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}
	var persona schema.PFSkillSearchModelsPersona

	// personIdから、履歴書を取得

	// personIdから、職務経歴書を取得

	// personIdから、過去のhalf_review, monthly_reviewを取得

	// persona 情報を生成

	c.JSON(http.StatusOK, persona)

}

func FaceImage(c *gin.Context) {
	personID := c.Param("personId")
	if personID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "personId is required"})
		return
	}

	cs := vertex.NewCloudStorage()
	img, err := cs.GetFaceImage(personID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get face image", "details": err.Error()})
		return
	}

	c.Header("Content-Type", "image/jpeg")
	if err := jpeg.Encode(c.Writer, img, nil); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode image", "details": err.Error()})
		return
	}
}

func FindPerson(c *gin.Context) {
	var persona schema.PFSkillSearchModelsPersona
	if err := c.ShouldBindJSON(&persona); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}
	var apiKey string
	if os.Getenv("AISEARCH_API_KEY") != "" {
		apiKey = os.Getenv("AISEARCH_API_KEY")
	} else {
		apiKey = "" // 認証されたKeyを使用する場合は、ここで取得する必要があります
	}

	client, err := vertex.NewVertexAISearch(apiKey, "us", vertex.DS_EMPLOYEE_INFO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client", "details": err.Error()})
		return
	}
	if client == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client"})
		return
	}
	results, err := client.FindPerson(persona)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
		return
	}
	if len(results) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No results found"})
		return
	}

	c.JSON(http.StatusOK, results)
}
