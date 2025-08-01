package route

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"jp.co.moneyforward/pf-skillsearch/schema"
	"jp.co.moneyforward/pf-skillsearch/vertex"
)

func GeneratePersona(c *gin.Context) {
	var person schema.PFSkillSearchModelsPerson
	if err := c.ShouldBindJSON(&person); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}
	employeeId := person.EmployeeId
	log.Println("Generating persona for employeeId:", employeeId)
	csClient := vertex.NewCloudStorage()
	// employeeIdから、履歴書を取得
	// employeeIdから、職務経歴書を取得
	// employeeIdから、過去のhalf_review, monthly_reviewを取得
	halfReview, err := csClient.HalfReview(employeeId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get half review", "details": err.Error()})
		return
	}

	monthlyReview, err := csClient.MonthlyReview(employeeId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get monthly review", "details": err.Error()})
		return
	}

	personaGen, err := vertex.NewLLM().GeneratePersona(
		halfReview,
		monthlyReview,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate persona", "details": err.Error()})
		return
	}

	var persona schema.PFSkillSearchModelsPersona
	if err := json.Unmarshal([]byte(personaGen), &persona); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal persona", "details": err.Error()})
		return
	}

	// persona 情報を生成
	c.JSON(http.StatusOK, persona)

}
