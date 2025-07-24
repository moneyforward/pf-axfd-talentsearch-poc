package route

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
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

	client, err := vertex.NewVertexAISearch(apiKey, os.Getenv("GOOGLE_CLOUD_PROJECT"), "us")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client", "details": err.Error()})
		return
	}
	if client == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Vertex AI client"})
		return
	}
	results, err := client.SearchPeople(query)
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
