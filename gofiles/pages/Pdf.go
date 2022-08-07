package pages

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
)

func init() {
	homepageTpl = GetTemplate("index")
}
func PdfHandler(w http.ResponseWriter, r *http.Request) {
	print(r.Body)
}
func GetPDF(w http.ResponseWriter, r *http.Request) {
	print(r.Body)
}
func PostPDF(w http.ResponseWriter, r *http.Request) {
	file, handler, err := r.FormFile("file")
	if err != nil {
		fmt.Println("Error Retrieving the File")
		fmt.Println(err)
		return
	}
	defer file.Close()
	fmt.Printf("Uploaded File: %+v\n", handler.Filename)
	fmt.Printf("File Size: %+v\n", handler.Size)
	fmt.Printf("MIME Header: %+v\n", handler.Header)

	// Create a temporary file within our temp-images directory that follows
	// a particular naming pattern
	tempFile, err := os.CreateTemp("", "u-*.pdf")
	if err != nil {
		fmt.Println(err)
	}
	defer os.Remove(tempFile.Name())

	// read all of the contents of our uploaded file into a
	// byte array
	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println(err)
	}
	// write this byte array to our temporary file
	tempFile.Write(fileBytes)
	tempFile.Close()
	// return that we have successfully uploaded our file!

	cmd := exec.Command("gswin64", "-o", "out.pdf", "-sDEVICE=pdfwrite", "-dFILTERTEXT", tempFile.Name())

	if err := cmd.Run(); err != nil {
		fmt.Println(err)
	}
	//get the out.pdf data
	contents, err := os.ReadFile("out.pdf")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Printf((string(contents[0])))
	fmt.Printf("File name is " + tempFile.Name())
	w.Write(contents)
}
