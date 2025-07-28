package vertex

import (
	"bytes"
	"context"
	"image"
	"io"
	"log"

	"cloud.google.com/go/storage"
)

type CloudStorage struct {
}

func NewCloudStorage() *CloudStorage {
	return &CloudStorage{}
}

func (cs *CloudStorage) client() (*storage.Client, error) {
	ctx := context.Background()
	client, err := storage.NewClient(ctx)
	if err != nil {
		log.Fatalf("Failed to create cloud storage client: %v", err)
		return nil, err
	}
	return client, nil
}

func (cs *CloudStorage) GetFaceImage(personID string) (image.Image, error) {
	client, err := cs.client()
	if err != nil {
		return nil, err
	}

	// Assuming the container name is "face-images" and the blob name is personID + ".jpg"
	bucket := client.Bucket("pf_ai_app")
	blob := bucket.Object("photos/" + personID + ".jpg")

	// Get the reader for the blob
	reader, err := blob.NewReader(context.Background())
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	// Read the image data
	imgData, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	// Decode the image
	img, _, err := image.Decode(bytes.NewReader(imgData))
	if err != nil {
		return nil, err
	}

	// Return the image
	return img, nil
}
