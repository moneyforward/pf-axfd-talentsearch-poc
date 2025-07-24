package route

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"jp.co.moneyforward/pf-skillsearch/schema"
)

func SearchPeople(c *gin.Context) {
	var req struct {
		Name string `json:"name"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	var apiKey string
	if os.Getenv("AISEARCH_API_KEY") != "" {
		apiKey = os.Getenv("AISEARCH_API_KEY")
	} else {
		apiKey = "" // 認証されたKeyを使用する場合は、ここで取得する必要があります
	}

	client := VertexAISearch.NewVertexAISearch(apiKey, "your-project-id", "us-central1")

	// Simulate a search operation
	people := []string{"Alice", "Bob", "Charlie"} // Example data
	results := []schema.PFSkillSearchModelsPerson{}
	for _, person := range people {
		if strings.Contains(strings.ToLower(person), strings.ToLower(req.Name)) {
			results = append(results, schema.PFSkillSearchModelsPerson{})
		}
	}

	c.JSON(http.StatusOK, results)
}
