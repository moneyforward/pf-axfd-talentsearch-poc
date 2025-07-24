package route

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"google.golang.org/genai"
)

func SearchPeople(c *gin.Context) {
	var req struct {
		Name string `json:"name"`
	}
	ctx := c.Request.Context()
	client, err := genai.APIAuth(ctx, &genai.ClientConfig{
		APIKey:   os.Getenv("GOOGLE_CLOUD_API_KEY"),
		Project:  os.Getenv("GOOGLE_CLOUD_PROJECT"),
		Location: os.Getenv("GOOGLE_CLOUD_LOCATION"),
		Backend:  genai.BackendVertexAI,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create GenAI client"})
		return
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Simulate a search operation
	people := []string{"Alice", "Bob", "Charlie"} // Example data
	results := []string{}
	for _, person := range people {
		if strings.Contains(strings.ToLower(person), strings.ToLower(req.Name)) {
			results = append(results, person)
		}
	}

	c.JSON(http.StatusOK, results)
}
