package route

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func SearchPeople(c *gin.Context) {
	var req struct {
		Name string `json:"name"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Simulate a search operation
	people := []string{"Alice", "Bob", "Charlie"} // Example data
	results := []PFSkillSearchModelsPerson{}
	for _, person := range people {
		if strings.Contains(strings.ToLower(person), strings.ToLower(req.Name)) {
			results = append(results, PFSkillSearchModelsPerson{Name: person})
		}
	}

	c.JSON(http.StatusOK, results)
}
