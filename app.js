const dotenv = require('dotenv').config();
const OpenAI = require('openai');
const cloudinary = require("./cloudinary");

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

async function main() {

    let originalPics = ["https://media-photos.depop.com/b1/18478264/1707102797_c9916501009e4606857eafcad1ff06ef/P0.jpg","https://media-photos.depop.com/b1/31102532/1704974739_1d531ca0514b46d5acf7edd25ade5bcc/P0.jpg", 
    "https://media-photos.depop.com/b1/31102532/1704975274_48fad6ed885241538e317e9d7ee73ec3/P0.jpg", "https://media-photos.depop.com/b1/18478264/1707102879_b991ba70ff0c4dae94cd8e6df86689d5/P0.jpg", "https://media-photos.depop.com/b1/18478264/1707102910_5719f9a34d444472819e8ffeb87f6757/P0.jpg",
    "https://media-photos.depop.com/b1/31102532/1704973897_9b98096b8cff42b38b1f15be00a2c942/P0.jpg","https://media-photos.depop.com/b1/31102532/1704974387_242b87f19d8a4c09a92a68ec5172ac1b/P0.jpg"];

    // let reducedPics = [];

    async function processPics(originalPics) {
        const promises = originalPics.map(pic => cloudinary.reducePhoto(pic));
        const reducedPics = await Promise.all(promises);
    
        return reducedPics;
    }
    
    reducedPics = await processPics(originalPics);
    console.log(reducedPics);

    const imageInputs = reducedPics.map(url => ({
        type: "image_url",
        image_url: { url, "detail": "low" }
        // image_url: { url ,  },

      }));
      

    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "There are multiple photos of multiple clothing pieces. Index the input photos, starting from 1 and group these photos into individual clothing pieces and provide the photo indexes for each item." },
                    ...imageInputs 
                ],
            },
        ],
        max_tokens: 300,
    });
    console.log(response.choices[0]);
}
main();

