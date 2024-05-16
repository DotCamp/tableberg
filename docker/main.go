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

const DOCKER_DIR = "./docker"

var CLI struct {
	Serve CommonOptions `cmd:"" help:"Serve a module."`
	Test  CommonOptions `cmd:"" help:"Test a module."`
	Stop  struct{}      `cmd:"" help:"Stop all running containers."`
}

type CommonOptions struct {
	PHP         string `optional:"" name:"php" short:"p" help:"Specify PHP version."`
	WordPress   string `optional:"" name:"wp" short:"w" help:"Specify WordPress version."`
	FreeOnly    bool   `optional:"" name:"free-only" short:"f" help:"Use only free resources."`
	Interactive bool   `optional:"" short:"i" help:"Run in interactive mode."`
	Port        string `optional:"" help:"Specify the port"`
	Rebuild     bool   `optional:"" help:"Rebuild the docker image"`
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
	case "stop":
		stopContainers()
		return
	default:
		fmt.Println("Unknown command")
		ctx.PrintUsage(true)
		return
	}

	php, wp := getVesions(cmd)

	slug_pre := "tableberg_" + ctx.Command()
	if cmd.FreeOnly {
		slug_pre += "_free"
	}

	reg := regexp.MustCompile(`[^a-zA-Z0-9]+`)
	slug := reg.ReplaceAllString(slug_pre+"_php_"+php+"_wp_"+wp, "_")

	dirpath := DOCKER_DIR + "/images/" + slug

	info, err := os.Stat(dirpath)

	if cmd.Port == "" {
		cmd.Port = "8000"
	}

	if os.IsNotExist(err) {
		copyFiles(php, wp, slug, cmd.FreeOnly, isServe)
		startServer(slug, cmd)
	} else if err == nil && info.IsDir() {
		startServer(slug, cmd)
	} else {
		fmt.Println("Something went wrong!")
		return
	}
}

func startServer(slug string, opts CommonOptions) {
	fmt.Println("Starting the server...")
	if err := os.Chdir(DOCKER_DIR + "/images/" + slug); err != nil {
		fmt.Println(err)
	}

	var cmd *exec.Cmd
	if opts.Rebuild {
		cmd = exec.Command("docker-compose", "up", "-d", "--build")
	} else {
		cmd = exec.Command("docker-compose", "up", "-d")

	}
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	cmd.Env = append(os.Environ(), "TABLEBERG_PORT="+opts.Port)

	if err := cmd.Run(); err != nil {
		fmt.Println("command execution failed: %w", err)
	}
}

func stopContainers() {
	fmt.Println("Stopping all containers...")

	cmdList := exec.Command("docker", "ps", "-q")
	cmdList.Stderr = os.Stderr
	ids, err := cmdList.Output()
	if err != nil {
		fmt.Printf("Failed to list containers: %v\n", err)
		return
	}

	containers := strings.Split(string(ids), "\n")

	for _, id := range containers {
		if id == "" {
			continue
		}
		fmt.Print(id + "...\r")
		cmdStop := exec.Command("docker", "stop", id)
		cmdStop.Stdout = os.Stdout
		cmdStop.Stderr = os.Stderr
		if err := cmdStop.Run(); err != nil {
			fmt.Printf("Failed to stop container: %v\n", err)
		}
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
		copyFile(DOCKER_DIR+"/meta/init-free.sh", DOCKER_DIR+"/images/"+slug+"/init.sh")
	} else {
		copyFile(DOCKER_DIR+"/meta/init.sh", DOCKER_DIR+"/images/"+slug+"/init.sh")
	}
	if serve {
		if freeOnly {
			copyFile(DOCKER_DIR+"/meta/docker-compose-serve-free.yml", DOCKER_DIR+"/images/"+slug+"/docker-compose.yml")
		} else {
			copyFile(DOCKER_DIR+"/meta/docker-compose-serve.yml", DOCKER_DIR+"/images/"+slug+"/docker-compose.yml")
		}
		copyFile(DOCKER_DIR+"/meta/Dockerfile_serve", DOCKER_DIR+"/images/"+slug+"/Dockerfile")
	} else {
		if freeOnly {
			copyFile(DOCKER_DIR+"/meta/Dockerfile_test_free", DOCKER_DIR+"/images/"+slug+"/Dockerfile")
		} else {
			copyFile(DOCKER_DIR+"/meta/Dockerfile_test", DOCKER_DIR+"/images/"+slug+"/Dockerfile")
		}
		copyFile(DOCKER_DIR+"/meta/docker-compose-test.yml", DOCKER_DIR+"/images/"+slug+"/docker-compose.yml")
	}

	replaceStringsInFile(DOCKER_DIR+"/images/"+slug+"/docker-compose.yml", map[string]string{
		"__TABLEBERG_DOCKER_ID__": slug,
		"__PHP_VERSION__":         php,
		"__WP_VERSION__":          wp,
	})
	replaceStringsInFile(DOCKER_DIR+"/images/"+slug+"/Dockerfile", map[string]string{
		"__TABLEBERG_DOCKER_ID__": slug,
		"__PHP_VERSION__":         php,
		"__WP_VERSION__":          wp,
	})
}
