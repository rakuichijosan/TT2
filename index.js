import puppeteer from "puppeteer";
import fs from 'fs';
import fetch from 'node-fetch';

  async function fetchTweets() {
    const browser = await puppeteer.launch({
      headless:  false, // Cambia a true para la versión final
      slowMo: 50,
      userDataDir: 'C:\\Users\\ahri1\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1',
    });

    const page = await browser.newPage();

    //---------------------INICIO DE SESION---------------------//
    // Navega a la página de inicio de sesión de Twitter
    //await page.goto('https://twitter.com/login');

    // Espera a que los elementos de entrada estén disponibles
    /*await page.waitForSelector('input[name="text"]');

    await page.type('input[name="text"]', 'ahri117@hotmail.com');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
      const nextButton = buttons.find(button => button.innerText.includes('Siguiente'));
      if (nextButton) nextButton.click();
    });
    
    await page.waitForSelector('input[name="text"]');

    await page.type('input[name="text"]', '@VictorLuisCarv');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
      const nextButton = buttons.find(button => button.innerText.includes('Siguiente'));
      if (nextButton) nextButton.click();
    });
    
    await page.waitForSelector('input[name="password"]', { visible: true });
    
    await page.type('input[name="password"]', 'aliwuhdpoijfs@');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
      const nextButton = buttons.find(button => button.innerText.includes('Iniciar sesión'));
      if (nextButton) nextButton.click();
    });*/
    // --------------------------------------------------------------
    //await page.waitForNavigation();
    // --------------------------------------------------------------
    //---------------------INICIO DE SESION---------------------//

    // Navega al perfil de @MetroCDMX directamente
    await page.goto('https://twitter.com/MetroCDMX', { waitUntil: "networkidle2" });
    await page.waitForSelector('article [lang]', {timeout: 5000});

    // Obtén el último tweet
    const tweet = await page.evaluate(() => {
      const tweetNode = document.querySelector('article [lang]');
      let tweetImage = null;
      if (tweetNode) {
        const tweetText = tweetNode.innerText;
        /*const imageNode = tweetNode.closest('article').querySelector('img[src*="twimg"]');
        if (imageNode) {
          tweetImage = imageNode.src;
        }*/
        const imageNodes = tweetNode.closest('article').querySelectorAll('img[src*="twimg"]');
        tweetImages = Array.from(imageNodes).map(img => img.src);
        tweetImage = tweetImages[1];
        const timeElement = tweetNode.closest('article').querySelector('time');
        const tweetDate = timeElement ? timeElement.getAttribute('datetime') : null;
        return { tweetText, tweetImage, tweetDate };
      }
      return null;
    });

    await browser.close();

    if (tweet && tweet.tweetImage) {
      // Aquí se realizaría la solicitud para obtener la imagen en formato binario
      const response = await fetch(tweet.tweetImage);
      const imageBuffer = await response.buffer();
      tweet.tweetImage = imageBuffer;
  
      // Aquí podrías proceder a almacenar imageBuffer en tu base de datos
      // Por ejemplo, este paso dependerá de tu base de datos y cómo manejas las conexiones a la misma.
      console.log('Imagen obtenida en formato binario:', imageBuffer);
    }

    // Define el nombre y ruta del archivo JSON
    const filePath = 'tweets.json';

    // Lee el archivo JSON existente si existe, o inicializa un arreglo vacío
    let tweets = [];
    if (fs.existsSync(filePath)) {
      tweets = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // Verifica si el último tweet obtenido es diferente al último guardado
    if (tweet && (!tweets.length || tweet.tweetText !== tweets[tweets.length - 1].tweetText)) {
      tweets.push(tweet); // Añade el nuevo tweet al arreglo
      fs.writeFileSync(filePath, JSON.stringify(tweets, null, 2), 'utf-8'); // Guarda el arreglo actualizado en el archivo JSON
      console.log('Nuevo tweet agregado:', tweet);
    } else {
      console.log('El último tweet ya está guardado o no se encontraron nuevos tweets.');
    }
  }

  fetchTweets();