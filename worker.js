export default {
    // fetch anropas när en http klient anropar servern
   async fetch(request, env, ctx) { //note env och ctx kommer med automatiskt

       // klassen används för att byta ut alla bilder på den hämtade sidan
       class AttributeHandler 
       {
           constructor(){}
           element(element)
           {
               element.setAttribute("src","https://pngimg.com/uploads/smurf/smurf_PNG18.png");	
           }
       }

       // klassen används till för att byta ut vissa ord till smurf             
       class ElementHandler 
       {
           // probability är sannolikheten för ett ord att bli smurfat
           constructor(probability)
           {
               this.probability = probability;
               this.accumulatedText = '';        
           }
           element(element)
           {           
               var changedText = "";
               const tokens = this.accumulatedText.split(" ");
               tokens.forEach(token => {
                   var randNum = Math.random()
       
                   if (randNum < this.probability)
                   {
                       token = "Smurf";
                   }		
                   changedText += token + " ";					
               });
               element.setInnerContent( changedText );
           }
           // för att text läses in i chunks så behöver vi sätta ihop alla delar in i variablen accumulatedText
           text(text){
               this.accumulatedText += text.text;
           }
       }
   
       // hämtar hela sökvägen från request
       const url = new URL(request.url);

       // hämtar en lista med alla headers från request
       const headers = request.headers;

       // hämtar en lista med alla parametrar i request
       const searchParams = url.searchParams;

       // hämtar sökparametern url ur listan med parametrar
       var targetUrl = searchParams.get('url');

       // hämtar in vilken http klient som gjorde anropet (oftast webbläsare)
       var userAgent = headers.get('User-Agent');

       // skapar en rewriter som används för att skriva om innehållet i webbsidan som hämtas
       const rewriter = new HTMLRewriter()
       .on("h1", new ElementHandler(0.3))
       .on("h2", new ElementHandler(0.1))
       .on("img", new AttributeHandler());
   
       // kollar om url sökvägen börjar med /smurfalize   (felhanterar inte)
       if (url.pathname == "/smurfalize") {
           if (!targetUrl.startsWith("http")){
               targetUrl = ("https://" + targetUrl);
           }
           try {
               // använder en http klient för att hämta in en webbsida från en annan webbserver
               // await används på asynkrona funktioner för att de inte ska blockera huvudtråden medans vi väntar på svar från servern.
               // user-Agent skickas med för att vissa webbsidor inte tillåter anrop utan godkännd user-Agent
               // sätter språket till svenska för att det blir enklare än att ta in språket som med user-Agent. pga att alla användare är i sverige, 
               const response = await fetch(targetUrl, {
                   headers: { 
                       'User-Agent': 'userAgent',
                       'Accept-Language': 'sv-SE'
                   }
               });

               // om response code inte innom 200-299 kastar den ett fel medelande
               if (!response.ok) {
                   throw new Error("Network response was not ok: " + response.statusText);
               }
               
               // använder rewriter för att ändra innehållet av den hämtade webbsidan
               const smurfalizedResponse = rewriter.transform(response);

               // skickar den smurfiga htmlkoden till klienten
               return smurfalizedResponse;

               // om något går fel så skickas ett felmedelande till klienten
           } catch (error) {
               console.error('Fetching failed:', error);
               return new Response('Failed to fetch content')
           }
       }
   },
};