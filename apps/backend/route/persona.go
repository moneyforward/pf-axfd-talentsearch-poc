package route

import (
	"image/jpeg"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"jp.co.moneyforward/pf-skillsearch/schema"
	"jp.co.moneyforward/pf-skillsearch/vertex"
)

// GET　/api/people
// parameters: query string ?query=username
// returns: 200 OK with search results or 404 Not Found if no results found
func SearchPeople(c *gin.Context) {
	query := c.Param("query")
	var apiKey string
	if os.Getenv("AISEARCH_API_KEY") != "" {
		apiKey = os.Getenv("AISEARCH_API_KEY")
	} else {
		apiKey = "" // 認証されたKeyを使用する場合は、ここで取得する必要があります
	}

	client, err := vertex.NewVertexAISearch(apiKey, "us")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client", "details": err.Error()})
		return
	}
	if client == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client"})
		return
	}
	results, err := client.SearchPeopleMock(query)
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

	client, err := vertex.NewVertexAISearch(apiKey, "us")
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
