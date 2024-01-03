const dotenv = require('dotenv').config();
const OpenAI = require('openai');
const cloudinary = require("./cloudinary");

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const montbellPics = ["https://media-photos.depop.com/b1/3935119/1689136781_6c8681fd48c94fdaa31ce60e40b7b888/P0.jpg", "https://media-photos.depop.com/b1/3935119/1689136821_fb85eb9ef6b744179dfd4d3779be05bb/P0.jpg", "https://media-photos.depop.com/b1/3935119/1689136839_68956521a6964c8aa903f4dabd4f32f4/P0.jpg"]

const systemJSONInstructions= "You will only reply in a JSON format. These are different images of one item of clothing. You will describe this item of clothing in extreme detail, focusing on the category of item (e.g. Menswear -> Jackets -> Outdoors), brand, color(s), material, and condition."

async function secondaryOptions(primaryCategory) {
    switch (primaryCategory) { 
        case "Menswear":
            return "Tops, Shorts, Pants, Jackets, Coats, Suits, Blazers, Jeans, Shirts, Sweaters";
        case "Womenswear":
            return "Tops, Shorts, Pants, Jackets, Coats, Suits, Blazers, Jeans, Shirts, Sweaters";
    }
}

async function tertiaryOptions(secondaryCategory) {
    switch (secondaryCategory) {
        case "Tops":
            return "Tank Tops, T-Shirts, Dress Shirts, Polo Shirts, Hoodies";
        case "Shorts":
            return "Athletic Shorts, Cargo Shorts, Denim Shorts, Board Shorts, Chino Shorts";
        case "Pants":
            return "Dress Pants, Jeans, Chinos, Sweatpants, Cargo Pants";
        case "Jackets":
            return "Bomber Jackets, Windbreakers, Parkas, Denim Jackets, Leather Jackets";
        case "Coats":
            return "Trench Coats, Peacoats, Overcoats, Duffle Coats, Raincoats";
        case "Suits":
            return "Two-Piece Suits, Three-Piece Suits, Tuxedos, Seersucker Suits, Linen Suits";
        case "Blazers":
            return "Sport Coats, Dinner Jackets, Velvet Blazers, Corduroy Blazers, Linen Blazers";
        case "Jeans":
            return "Skinny Jeans, Slim Fit Jeans, Straight Leg Jeans, Bootcut Jeans, Flare Jeans";
        case "Shirts":
            return "Dress Shirts, Casual Shirts, Flannel Shirts, Hawaiian Shirts, Chambray Shirts";
        case "Sweaters":
            return "Crewneck Sweaters, V-Neck Sweaters, Cardigans, Turtlenecks, Cable Knit Sweaters";
    }
}

async function processPics(originalPics) {
    const promises = originalPics.map(pic => cloudinary.reducePhoto(pic));
    const reducedPics = await Promise.all(promises);    
    return reducedPics;
}

//reducedPics = await processPics(montbellPics);

//const imageInputs = reducedPics.map(url => ({
  //  type: "image_url",
    //image_url: { url, "detail": "low" }
  //}));

  /*
const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
        {"role": "system", "content": systemJSONInstructions},
        {
            role: "user",
            content: [
                ...imageInputs 
            ],
        },
    ],
    max_tokens: 300,
});
*/


async function main() {
    
    //let msg = response.choices[0].message.content
    
    let msg = '```json\n' +
    '{\n' +
    '  "Item": "Jacket",\n' +
    '  "Category": "Menswear -> Outerwear -> Insulated Jacket",\n' +
    '  "Brand": "Montbell",\n' +
    '  "Color": "Olive green",\n' +
    '  "Material": "Synthetic insulation, likely nylon outer fabric",\n' +
    '  "Condition": "Gently used with no visible damage",\n' +
    '  "Size": {\n' +
    '    "Japan": "XL",\n' +
    '    "USA/Europe": "L"\n' +
    '  },\n' +
    '  "Special Features": [\n' +
    '    "Lightweight design",\n' +
    '    "Quilted pattern for insulation distribution"\n' +
    '  ],\n' +
    '  "Brand Attributes": [\n' +
    '    "Brand logo on front left side",\n' +
    `    "Slogan 'Function is beauty' on the interior label"\n` +
    '  ],\n' +
    '  "Manufacturing": {\n' +
    '    "Country": "Japan",\n' +
    '    "Year": "Since 1975 (Brand established)"\n' +
    '  }\n' +
    '}\n' +
    '```'
    const thread = await openai.beta.threads.create();
    console.log(thread)

    await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: msg
    })

    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: "asst_XE2ZlJZr4PrupnVWhqfFMwr4"
    })

    let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
    )

    console.log(runStatus.status)

    while (runStatus.status !== "requires_action") {
        console.log(runStatus.status)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    }

    console.log(runStatus.required_action.submit_tool_outputs.tool_calls)
    console.log(runStatus.required_action.submit_tool_outputs.tool_calls[0].id)
    let toolCallID = runStatus.required_action.submit_tool_outputs.tool_calls[0].id;
 
    let argumentsValue = JSON.parse(runStatus.required_action.submit_tool_outputs.tool_calls[0].function.arguments);
    const primaryCat = argumentsValue.primaryCat;  
    console.log(primaryCat)


    let secondaryList = await secondaryOptions(primaryCat)
    console.log(secondaryList)
    
    await openai.beta.threads.runs.submitToolOutputs(
        thread.id,
        run.id,
        {
            tool_outputs: [
                {tool_call_id: toolCallID,
                output: secondaryList}
            ]
        }
    )

    console.log("bruh")

    runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
    )

    while (runStatus.status !== "requires_action") {
        console.log(runStatus.status)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    }

    console.log(runStatus.required_action.submit_tool_outputs.tool_calls)
    console.log(runStatus.required_action.submit_tool_outputs.tool_calls[0].id)
    toolCallID = runStatus.required_action.submit_tool_outputs.tool_calls[0].id;

    argumentsValue = JSON.parse(runStatus.required_action.submit_tool_outputs.tool_calls[0].function.arguments);
    console.log(argumentsValue)

    const secondaryCat = argumentsValue.secondaryCat;  
    let tertiaryList = await tertiaryOptions(secondaryCat)
    console.log(tertiaryList)
    
    await openai.beta.threads.runs.submitToolOutputs(
        thread.id,
        run.id,
        {
            tool_outputs: [
                {tool_call_id: toolCallID,
                    output: tertiaryList}
            ]
        }
    )

    while (runStatus.status !== "completed") {
        console.log(runStatus.status)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    }

    const messages = await openai.beta.threads.messages.list(thread.id)

    const lastMessageForRun = messages.data
    .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
    )
    .pop()

    if (lastMessageForRun) {
        console.log(`${lastMessageForRun.content[0].text.value} \n`)
    }

}
main();

