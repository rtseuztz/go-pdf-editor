package pages

import (
	"net/http"
)

func init() {
	homepageTpl = GetTemplate("index")
}
func SetUpFirebase() {
	// app, err := firebase.NewApp(context.Background(), nil)
	// if err != nil {
	// 		log.Fatalf("error initializing app: %v\n", err)
	// }
}
func Login(w http.ResponseWriter, r *http.Request) {
	print(r.Body)
}
