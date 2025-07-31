package vertex

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/invopop/jsonschema"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/azure"
	"jp.co.moneyforward/pf-skillsearch/schema"
)

type LLM struct {
	client     openai.Client
	endpoint   string
	apiKey     string
	apiVersion string
	deployment string
}

func NewLLM() *LLM {

	endpoint := os.Getenv("AOAI_ENDPOINT")
	apiKey := os.Getenv("AOAI_API_KEY")
	apiVersion := "2024-10-21"
	client := openai.NewClient(
		azure.WithEndpoint(endpoint, apiVersion),
		azure.WithAPIKey(apiKey),
	)

	return &LLM{
		client:     client,
		endpoint:   endpoint,
		apiKey:     apiKey,
		apiVersion: apiVersion,
		deployment: "gpt-4o", // Default deployment, can be changed if needed
	}
}

func (llm *LLM) ChatCompletion(
	ctx context.Context,
	params openai.ChatCompletionNewParams,
) (*openai.ChatCompletion, error) {
	httpClient := &http.Client{}
	url := llm.endpoint + "openai/deployments/" + llm.deployment + "/chat/completions?api-version=" + llm.apiVersion
	payload, err := json.Marshal(params)
	if err != nil {
		log.Println("Error marshalling payload:", err)
		return nil, err
	}

	log.Println("ChatCompletion URL:", url)
	log.Println("ChatCompletion payload:", string(payload))

	req, err := http.NewRequest("POST", url, bytes.NewReader(payload))
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("api-key", llm.apiKey)
	if err != nil {
		log.Println("Error creating request:", err)
		return nil, err
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		log.Println("Error in ChatCompletion:", err)
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		log.Println("ChatCompletion request failed with status:", resp.Status)
		return nil, err
	}
	var response openai.ChatCompletion
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		log.Println("Error decoding response:", err)
		return nil, err
	}
	log.Println("ChatCompletion response:", response)

	return &response, nil
}

func (llm *LLM) GeneratePersona(
	halfReview schema.PFSkillSearchModelsHalfReview,
	monthlyReview schema.PFSkillSearchModelsMonthlyReview,
) (string, error) {

	jsonSchema := `{
	skills: [{
		name: "SkillName",
		experience: 2,
		description: "⚪︎にチャレンジしています。"
	}, {}],
	career: [{
		start_month: int16;
	    end_month?: int16;
	    company: string;
	    position: string;
	    role: "Business" | "Engineer" | "Manager" | "Other";
	    description?: string;
	}],
	}
	`
	// jsonSchema := `{
	// 	skills: [{
	// 	name: "SkillName",
	// 	experience: 2,
	// 	description: "⚪︎にチャレンジしています。"
	// }, {}],
	// career: ""
	// }`

	system := `あなたは人事評価者です。
	過去の評価内容を元に、社員の経歴と、
	スキルを分析し、JSON形式で出力します。
	json形式は以下の通りです。
出力はJSONのみを出力し、他の情報は一切出力しないでください。
markdownやHTMLなどのフォーマットは使用しないでください。
	` + jsonSchema

	var prompt = ""
	prompt += `過去の半期レビューと月次レビューを元に、私の経歴とスキルを分析してください。
## 半期レビュー 
halfReview.SelfAssessmentScore:
` + halfReview.SelfAssessmentScore + `
halfReview.HalfYearSelfReviewAchievementGrowth:
` + halfReview.HalfYearSelfReviewAchievementGrowth + `
halfReview.ShortTerm1yr
` + halfReview.ShortTerm1yr + `
halfReview.MedTerm23yr:
` + halfReview.MedTerm23yr + `
## 月次レビュー
monthlyReview.MonthlyGoal:
` + monthlyReview.MonthlyGoal + `
monthlyReview.MonthlyReview:
` + monthlyReview.MonthlyReview
	// PersonaSchema := GenerateSchema[schema.PFSkillSearchModelsPersona]()

	// schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
	// 	Name:        "persona",
	// 	Description: openai.String("Persona information generated from the reviews"),
	// 	Schema:      PersonaSchema,
	// 	Strict:      openai.Bool(true),
	// }
	// ====================================
	params := openai.ChatCompletionNewParams{
		Model: openai.ChatModel("gpt-4o"),
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(system),
			openai.UserMessage(prompt),
		},
		Temperature: openai.Float(0.0),
		ResponseFormat: openai.ChatCompletionNewParamsResponseFormatUnion{
			OfJSONObject: &openai.ResponseFormatJSONObjectParam{
				Type: "json_object",
			},
		},
	}

	// -======================

	response, err := llm.ChatCompletion(context.Background(), params)

	if err != nil {
		return "", err
	}

	if len(response.Choices) == 0 {
		return "", nil
	}
	if response.Choices[0].Message.Content == "" {
		return "", nil
	}
	content := response.Choices[0].Message.Content
	log.Println("Generated Persona:", content)
	return content, nil
}

func GenerateSchema[T any]() interface{} {
	// Structured Outputs uses a subset of JSON schema
	// These flags are necessary to comply with the subset
	reflector := jsonschema.Reflector{
		AllowAdditionalProperties: false,
		DoNotReference:            true,
	}
	var v T
	schema := reflector.Reflect(v)
	return schema
}
