# Authentication with Node JS
The authentication is very much required to safe guard the users. This project shows all the different levels of security involved in this process. 

## The PC should have:
	• Node JS 
 	• VS code
 	• Git bash

## How to check different levels of security?
 
To do so first open the git bash and clone the repository by:

```bash 
git clone https://github.com/Sujithk007/Authentication-Node-JS.git
``` 
Now open the git bash inside the cloned project and type the following to see all the logs:

```bash 
git log
```

You should see something like this:
```bash
	1. commit adac9a194f99845f0f0f7e40ce064be9bcc712ed
	2. Finishing UP the App with Google OAuth 2.0 Authentication. 
	3. commit 524b749e5fffc1cade6cc1e7d8f8a0bdccf30897
	4. Level 3 security (Passport, session and cookies)
	5. commit 195fa0ae58481a32a6ff9544322e64e389b0d69f
	6. Level 2 security --> (Bcrypt hashing)
	7. commit 4b7c2f809e969af0cb5a7060fcb409673063d354
	8. Level 1 Security
```
If you would like to see the code for  Level 1 security Only. for example, you can simply type:

```bash 
git checkout 4b7c2f809e969af0cb5a7060fcb409673063d354 .
```
**Note:** the dot at the end is very important, don't miss it out.

Then type the following to open that in VS Code
```bash 
code .
```
