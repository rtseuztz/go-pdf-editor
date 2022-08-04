package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"pdf-editor/gofiles/pages"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/joho/godotenv/autoload"
)

// var navigationBarHTML string
// var homepageTpl *template.Template
//var secondViewTpl *template.Template
//var thirdViewTpl *template.Template

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println(os.Getenv("KEY"))
	}
	serverCfg := Config{
		Host:         "localhost:8000",
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	htmlServer := Start(serverCfg)
	defer htmlServer.Stop()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt)
	<-sigChan

	fmt.Println("main : shutting down")
}

// Config provides basic configuration
type Config struct {
	Host         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

// HTMLServer represents the web service that serves up HTML
type HTMLServer struct {
	server *http.Server
	wg     sync.WaitGroup
}

func redir(w http.ResponseWriter, r *http.Request) {
	//user searched
	fmt.Printf("bolonga")
	err := r.ParseForm()
	if err != nil {
		log(fmt.Printf("broke"))
	}
	summonerName := r.FormValue("summoner_input")
	if len(summonerName) > 0 {
		http.Redirect(w, r, fmt.Sprintf("/summoner/%s", summonerName), http.StatusSeeOther)
	}
}

func log(i int, err error) {
	panic("unimplemented")
}

// Start launches the HTML Server
func Start(cfg Config) *HTMLServer {
	// Setup Context
	_, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup Handlers
	router := mux.NewRouter()

	router.PathPrefix("/static/css/").Handler(http.StripPrefix("/static/css/", http.FileServer(http.Dir("../static/css"))))
	router.PathPrefix("/static/js/").Handler(http.StripPrefix("/static/js/", http.FileServer(http.Dir("../static/js"))))
	router.PathPrefix("/static/images/").Handler(http.StripPrefix("/static/images/", http.FileServer(http.Dir("../static/images"))))

	router.HandleFunc("/", pages.HomeHandler).Methods("GET")
	router.HandleFunc("/", redir).Methods("POST")
	router.HandleFunc("/summoner/{name}", pages.SummonerHandler)
	//router.HandleFunc("/second", SecondHandler)
	//router.HandleFunc("/third/{number}", ThirdHandler)

	// Create the HTML Server
	htmlServer := HTMLServer{
		server: &http.Server{
			Addr:           cfg.Host,
			Handler:        router,
			ReadTimeout:    cfg.ReadTimeout,
			WriteTimeout:   cfg.WriteTimeout,
			MaxHeaderBytes: 1 << 20,
		},
	}

	// Add to the WaitGroup for the listener goroutine
	htmlServer.wg.Add(1)

	// Start the listener
	go func() {
		fmt.Printf("\nHTMLServer : Service started : Host=%v\n", cfg.Host)
		htmlServer.server.ListenAndServe()
		htmlServer.wg.Done()
	}()

	return &htmlServer
}

// Stop turns off the HTML Server
func (htmlServer *HTMLServer) Stop() error {
	// Create a context to attempt a graceful 5 second shutdown.
	const timeout = 5 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	fmt.Printf("\nHTMLServer : Service stopping\n")

	// Attempt the graceful shutdown by closing the listener
	// and completing all inflight requests
	if err := htmlServer.server.Shutdown(ctx); err != nil {
		// Looks like we timed out on the graceful shutdown. Force close.
		if err := htmlServer.server.Close(); err != nil {
			fmt.Printf("\nHTMLServer : Service stopping : Error=%v\n", err)
			return err
		}
	}

	// Wait for the listener to report that it is closed.
	htmlServer.wg.Wait()
	fmt.Printf("\nHTMLServer : Stopped\n")
	return nil
}
