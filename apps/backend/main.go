package main

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"jp.co.moneyforward/pf-skillsearch/route"
)

func main() {

	log.Println("start server")

	router := gin.Default()

	router.MaxMultipartMemory = 768 << 20 // 768 MiB

	// setting cors
	router.Use(cors.New(cors.Config{
		// would to allow all origins
		AllowOrigins: []string{
			"http://localhost:5173", // Vite development server
			"*",
		},
		// allow GET, POST, PUT, DELETE, OPTIONS methods.
		AllowMethods: []string{
			"POST",
			"GET",
			"PUT",
			"OPTIONS",
			"DELETE",
		},
		// allow http request headers.
		AllowHeaders: []string{
			"Access-Control-Allow-Credentials",
			"Access-Control-Allow-Headers",
			"Content-Type",
			"Content-Length",
			"Accept-Encoding",
			"Accept",
			"Authorization",
			"X-Ms-Client-Principal-Name",
			"X-Ms-Token-Aad-Access-Token",
		},
		AllowCredentials: true,
		MaxAge:           24 * time.Hour,
	}))

	// frontend hosting.
	router.NoRoute(route.Frontend)
	router.GET("/api/health", route.HealthCheck)

	router.Run(":8080")
}
