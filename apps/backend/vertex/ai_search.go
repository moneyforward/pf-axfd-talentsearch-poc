package vertex

import (
	"context"

	"google.golang.org/genai"
)

type VertexAISearch struct {
	client *genai.Client
}

func NewVertexAISearch(apiKey, project, location string) (*VertexAISearch, error) {
	client, err := genai.NewClient(context.Background(), &genai.ClientConfig{
		APIKey:   apiKey,
		Project:  project,
		Location: location,
		Backend:  genai.BackendVertexAI,
	})
	if err != nil {
		return nil, err
	}

	return &VertexAISearch{client: client}, nil
}

func (s *VertexAISearch) SearchPeople(name string) ([]string, error) {
	return nil, nil
}
