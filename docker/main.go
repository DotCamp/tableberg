package main

import (
	"fmt"
	"io"
	"os"
	"regexp"
	"strings"

	"os/exec"

	"github.com/alecthomas/kong"

	"github.com/manifoldco/promptui"
)

const DOCKER_DIR = "."

var CLI struct {
	Serve CommonOptions `cmd:"" help:"Serve a module."`
	Test  CommonOptions `cmd:"" help:"Test a module."`
}

type CommonOptions struct {
	PHP         string `optional:"" name:"php" short:"p" help:"Specify PHP version."`
	WordPress   string `optional:"" name:"wp" short:"w" help:"Specify WordPress version."`
	FreeOnly    bool   `optional:"" name:"free-only" short:"f" help:"Use only free resources."`
	Interactive bool   `optional:"" short:"i" help:"Run in interactive mode."`
}

func main() {
	ctx := kong.Parse(&CLI)
	var cmd CommonOptions
	var isServe bool
	switch ctx.Command() {
	case "serve":
		isServe = true
		cmd = CLI.Serve
	case "test":
		isServe = false
		cmd = CLI.Test
	default:
		fmt.Println("Unknown command")
		ctx.PrintUsage(true)
		return
	}

	php, wp := getVesions(cmd)
	reg := regexp.MustCompile(`[^a-zA-Z0-9]+`)
	slug := reg.ReplaceAllString("tableberg_"+ctx.Command()+"_php_"+php+"_wp_"+wp, "_")

	dirpath := DOCKER_DIR + "/images/" + slug

	info, err := os.Stat(dirpath)

	if os.IsNotExist(err) {
		copyFiles(php, wp, slug, cmd.FreeOnly, isServe)
		startServer(slug)
	} else if err == nil && info.IsDir() {
		startServer(slug)
	} else {
		fmt.Println("Something went wrong!")
		return
	}
}

func startServer(slug string) {
	fmt.Println("Starting the server...")
	if err := os.Chdir(DOCKER_DIR + "/images/" + slug); err != nil {
		fmt.Println(err)
	}

	cmd := exec.Command("docker-compose", "up", "-d")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("command execution failed: %w", err)
	}
}

func getPhpVersion() string {
	versions := []string{"7.0", "7.1"}
	prompt := promptui.Select{
		Label: "Select PHP Version",
		Items: versions,
		Size:  4,
	}

	i, _, err := prompt.Run()

	if err != nil {
		return ""
	}
	return versions[i]
}

func getWordpressVersion() string {
	versions := []string{"5.5", "6.3"}
	prompt := promptui.Select{
		Label: "Select Wordpess Version",
		Items: versions,
		Size:  4,
	}

	i, _, err := prompt.Run()

	if err != nil {
		return ""
	}
	return versions[i]
}

func getVesions(cmd CommonOptions) (string, string) {
	php := cmd.PHP
	wp := cmd.WordPress

	if cmd.Interactive {
		for php == "" {
			php = getPhpVersion()
		}

		for wp == "" {
			wp = getWordpressVersion()
		}
	}

	if php == "" {
		php = "8.1"
	}
	if wp == "" {
		wp = "6.5.3"
	}
	return php, wp
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	if err != nil {
		return err
	}

	err = destFile.Sync()
	if err != nil {
		return err
	}

	return nil
}
func replaceStringsInFile(filePath string, replacements map[string]string) error {

	content, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}

	result := string(content)
	for oldString, newString := range replacements {
		result = strings.Replace(result, oldString, newString, -1)
	}

	// Write the modified content back to the file
	err = os.WriteFile(filePath, []byte(result), 0644)
	if err != nil {
		return err
	}

	return nil
}

func copyFiles(php string, wp string, slug string, freeOnly bool, serve bool) {
	fmt.Println("Running this combo for the first time...")
	dirpath := DOCKER_DIR + "/images/" + slug
	err := os.MkdirAll(dirpath, os.ModePerm)
	if err != nil {
		fmt.Println("Error creating directories:", err)
		return
	}

	if freeOnly {
		copyFile(DOCKER_DIR+"/meta/free-only/init.sh", DOCKER_DIR+"/images/"+slug+"/init.sh")
	} else {
		copyFile(DOCKER_DIR+"/meta/free-only/init.sh", DOCKER_DIR+"/images/"+slug+"/init.sh")
	}
	if serve {
		if freeOnly {
			copyFile(DOCKER_DIR+"/meta/free-only/docker-compose-serve.yml", DOCKER_DIR+"/images/"+slug+"/docker-compose.yml")
		} else {
			copyFile(DOCKER_DIR+"/meta/docker-compose-serve.yml", DOCKER_DIR+"/images/"+slug+"/docker-compose.yml")
		}
		copyFile(DOCKER_DIR+"/meta/Dockerfile_serve", DOCKER_DIR+"/images/"+slug+"/Dockerfile")
	} else {
		if freeOnly {
			copyFile(DOCKER_DIR+"/meta/free-only/Dockerfile_test", DOCKER_DIR+"/images/"+slug+"/Dockerfile")
		} else {
			copyFile(DOCKER_DIR+"/meta/Dockerfile_test", DOCKER_DIR+"/images/"+slug+"/Dockerfile")
		}
		copyFile(DOCKER_DIR+"/meta/docker-compose-serve.yml", DOCKER_DIR+"/images/"+slug+"/docker-compose.yml")
	}

	replaceStringsInFile(DOCKER_DIR+"/images/"+slug+"/docker-compose.yml", map[string]string{
		"__TABLEBERG_DOCKER_ID__": slug,
	})
	replaceStringsInFile(DOCKER_DIR+"/images/"+slug+"/Dockerfile", map[string]string{
		"__PHP_VERSION__": php,
		"__WP_VERSION__":  wp,
	})
}
