# fragments
This is my Lab 1 of Cloud Computing.

In this lab 1 we set up the development environent use npm scripts to run those commands.

AT first we have to install the node js and npm which in my case I already have so didn't have to install it again.  

After that I cloned this repo to my laptop and then came to fragments folder to install some dependencies. 

Ques. how to run the various scripts you just created
- lint, start, dev, debug I had use npm commands for all of them in my lab 1

1. for lint I did *npm run lint
2. for starting the server I did *npm start
3. for dev( development) I did *npm run dev as it will automatically loads the server using nodemon and for the nodemon I did * npm install --save-dev nodemon
4. for debug I did *npm run debug

The server was running on my web browser at lcalhost:8080 and we can access it on http://localhost:8080/

Also we can customize our environment variables for example PORT- this will specifies that the server listens on the port 8080 which is default but if we want to change it in future we can do that as well. 