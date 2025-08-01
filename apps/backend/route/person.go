package route

import (
	"image/jpeg"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"jp.co.moneyforward/pf-skillsearch/schema"
	"jp.co.moneyforward/pf-skillsearch/vertex"
)

func FindPerson(c *gin.Context) {
	var payload schema.PFSkillSearchModelsPayloadFindPersonRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}
	persona := payload.Persona
	var apiKey string
	if os.Getenv("AISEARCH_API_KEY") != "" {
		apiKey = os.Getenv("AISEARCH_API_KEY")
	} else {
		apiKey = "" // 認証されたKeyを使用する場合は、ここで取得する必要があります
	}

	client, err := vertex.NewVertexAISearch(apiKey, "us", vertex.DS_ALL)
	// -----------------------------
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client", "details": err.Error()})
		return
	}
	if client == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client"})
		return
	}
	// -----------------------------
	results, err := client.FindPerson(persona)
	// -----------------------------
	// find error handling
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
		return
	}
	if len(results) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No results found"})
		return
	}
	// -----------------------------
	var response schema.PFSkillSearchModelsPayloadFindPersonResponse
	var result []schema.PFSkillSearchModelsPayloadFindPersonResult
	for _, person := range results {
		result = append(result, schema.PFSkillSearchModelsPayloadFindPersonResult{
			Person: person,
			Score:  1.0, // Assuming a score of 1.0
		})
	}

	response.Result = result
	response.Count = int32(len(result))
	c.JSON(http.StatusOK, response)
}

func FaceImage(c *gin.Context) {
	employeeID := c.Param("employeeId")
	if employeeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "employeeId is required"})
		return
	}

	cs := vertex.NewCloudStorage()
	img, err := cs.GetFaceImage(employeeID)
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

func IsExistsCV(c *gin.Context) {
	employee_id := c.Param("employeeId")
	cs := vertex.NewCloudStorage()
	exists, err := cs.IsExistsCV(employee_id)
	if err != nil {
		log.Printf("Error checking CV existence for employee ID %s: %v", employee_id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Failed to check CV existence", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"exists": exists})
}

func IsExistsResume(c *gin.Context) {
	employee_id := c.Param("employeeId")
	cs := vertex.NewCloudStorage()
	exists, err := cs.IsExistsResume(employee_id)
	if err != nil {
		log.Printf("Error checking Resume existence for employee ID %s: %v", employee_id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Failed to check Resume existence", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"exists": exists})
}
