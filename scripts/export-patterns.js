const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

require("dotenv").config({
    path: path.resolve(process.cwd(), "scripts", ".env"),
});

const BASE_URL = process.env.BLOCKS_LIBRARY_URL;
const IMAGE_PADDING = 10;

function waitForCaptcha() {
    return new Promise((resolve) => {
        const readline = require("node:readline");
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(
            `Please complete the CAPTCHA or bot verification manually`,
            (name) => {
                rl.close();
                resolve();
            },
        );
    });
}

async function getDraftPosts(page) {
    const response = await fetch(
        `${BASE_URL}/wp-json/wp/v2/posts?page=${page}&categories=7&context=edit&status=draft&_embed=wp:term&_fields=id,title,content,slug,excerpt,tags,categories,_links.wp:term`,
        {
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `${process.env.BLOCKS_LIBRARY_USERNAME}:${process.env.BLOCKS_LIBRARY_PASSWORD}`,
                ).toString("base64")}`,
            },
        },
    );
    const res = await response.json();
    if (res?.code === "rest_post_invalid_page_number") {
        return [];
    }
    return res;
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    await page.goto(`${BASE_URL}/wp-login.php`, {
        waitUntil: "networkidle2",
    });

    try {
        await page.waitForSelector("#user_login", { timeout: 10000 });
    } catch (e) {
        await waitForCaptcha();
    }

    await page.type("#user_login", process.env.BLOCKS_LIBRARY_USERNAME);
    await page.type("#user_pass", process.env.BLOCKS_LIBRARY_PASSWORD);
    await page.click("#wp-submit");

    await page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 120000,
    });

    const upsellDir = "packages/tableberg/includes/Patterns/upsells";
    const imageDir = "packages/tableberg/includes/Patterns/images";
    const patternsDir = "packages/tableberg/includes/Patterns/data";
    const proPatternsDir = "packages/pro/includes/patterns";

    if (!fs.existsSync(patternsDir)) {
        fs.mkdirSync(patternsDir);
    }
    if (!fs.existsSync(proPatternsDir)) {
        fs.mkdirSync(proPatternsDir);
    }
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir);
    }
    if (!fs.existsSync(upsellDir)) {
        fs.mkdirSync(upsellDir);
    }

    const getBoundingBoxWithChildren = async (element) => {
        const boundingBox = await element.boundingBox();
        const children = await element.$$(":scope > *");

        let minX = boundingBox.x;
        let minY = boundingBox.y;
        let maxX = boundingBox.x + boundingBox.width;
        let maxY = boundingBox.y + boundingBox.height;

        for (const child of children) {
            const childBox = await child.boundingBox();
            if (childBox) {
                minX = Math.min(minX, childBox.x);
                minY = Math.min(minY, childBox.y);
                maxX = Math.max(maxX, childBox.x + childBox.width);
                maxY = Math.max(maxY, childBox.y + childBox.height);
            }
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    };

    const getPage = async (pageNum, after, upsellJson) => {
        // Get draft posts
        console.log(`Loading page: ${pageNum}`);
        const posts = await getDraftPosts(pageNum);
        console.log(`    Found ${posts.length} items.`);

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            console.log(`    Adding: [${post.id}] ${post.slug}`);
            if (!post.slug) {
                continue;
            }
            const categories = post._embedded["wp:term"][0].map(
                (term) => term.slug,
            );
            const tags = [];
            let isPro = false;
            post._embedded["wp:term"][1].forEach((tag) => {
                if (tag.slug === "pro") {
                    isPro = true;
                    return;
                }
                tags.push(tag.slug);
            });

            await page.goto(`${BASE_URL}/?p=${post.id}&preview=true`, {
                waitUntil: "networkidle0",
                timeout: 120000,
            });

            await page.waitForSelector(".wp-block-tableberg-wrapper", {
                visible: true,
            });

            const element = await page.$(".wp-block-tableberg-wrapper");
            const boundingBox = await getBoundingBoxWithChildren(element);

            const pattern = {
                title: post.title.rendered,
                description: post.excerpt.rendered,
                categories,
                keywords: ["table", "tableberg", ...tags],
                content: post.content.raw,
                viewportWidth: Math.ceil(boundingBox.width),
            };

            if (!isPro) {
                fs.writeFileSync(
                    path.resolve(patternsDir, post.slug + ".json"),
                    JSON.stringify(pattern),
                    "utf8",
                );
                continue;
            }

            const screenshotPath = path.join(imageDir, `${post.slug}.png`);
            fs.writeFileSync(
                path.resolve(proPatternsDir, post.slug + ".json"),
                JSON.stringify(pattern),
                "utf8",
            );
            const imageUrl = screenshotPath
                .replaceAll("\\", "/")
                .replace("packages/tableberg", "");
            pattern.content = `<!-- wp:image {"id":314,"sizeSlug":"full","linkDestination":"none","align":"center"} -->
            <figure class="wp-block-image aligncenter size-full"><img src="::PLUGIN_URL::${imageUrl}" alt=""/></figure>
            <!-- /wp:image -->`;
            fs.writeFileSync(
                path.resolve(upsellDir, "upsell-" + post.slug + ".json"),
                JSON.stringify(pattern),
                "utf8",
            );

            upsellJson.push({
                name: post.slug,
                title: post.title.rendered,
                upsellText: post.excerpt.rendered,
                image: imageUrl,
            });

            await page.screenshot({
                path: screenshotPath,
                clip: {
                    x: Math.max(0, boundingBox.x - IMAGE_PADDING),
                    y: Math.max(0, boundingBox.y - IMAGE_PADDING),
                    width: boundingBox.width + 4 * IMAGE_PADDING,
                    height: boundingBox.height + 2 * IMAGE_PADDING,
                },
            });
        }

        await after(posts);
    };

    let pageNum = 1;

    const upsellJson = [];

    const afterLoaded = async (posts) => {
        if (posts.length > 0) {
            pageNum++;
            await getPage(pageNum, afterLoaded, upsellJson);
        } else {
            await browser.close();

            fs.writeFileSync(
                path.resolve("packages/tableberg/src/components", "patterns.ts"),
                'export const PATTERN_UPSELLS = ' + JSON.stringify(upsellJson) + ';',
                "utf8",
            );
        }
    };

    await getPage(pageNum, afterLoaded, upsellJson);
})();
