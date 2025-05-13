# **AI Girlfriend App Deployment Summary**

## **How We Got It Working**

We successfully deployed the AI Girlfriend application to a Digital Ocean droplet. Here's a summary of what we accomplished:

1. Created a new Digital Ocean droplet specifically for the AI Girlfriend app  
2. Set up the backend server with Node.js, Express, and PM2 for process management  
3. Created a frontend application using React with styled components  
4. Configured Nginx as a reverse proxy to serve both the frontend and backend  
5. Set up the chat API to handle message exchanges between users and the AI  
6. Configured environment variables to disable Stripe integration and set high message limits

The application is now accessible at [http://64.227.7.250](http://64.227.7.250/), featuring a clean interface with home, chat, and profile pages.

## **How to Start It Again**

If you need to restart the application (after server reboot or if it stops for any reason):

1. SSH into your droplet:  
2. Copy  
3. ssh root@64.227.7.250  
4. Check the status of your applications:  
5. Copy  
6. pm2 list  
7. If the applications are not running, start them:  
8. Copy  
9. \# Start the backend  
10. cd /var/www/ai\-girlfriend/ai\_gf\_app/backend  
11. pm2 start index.js \--name ai-girlfriend  
12. \# Start the frontend  
13. cd /var/www/ai\-girlfriend/ai\_gf\_app/frontend/ai\-girlfriend\-frontend  
14. pm2 start serve \--name ai-girlfriend-frontend \-- \-s build \-l 3000  
15. \# Save the PM2 configuration  
16. pm2 save  
17. Check if Nginx is running:  
18. Copy  
19. systemctl status nginx  
20. If Nginx is not running, start it:  
21. Copy  
22. systemctl start nginx

## **Laptop and Droplet Management**

One of the great advantages of this setup is that you can turn off your laptop and the application will continue running on the Digital Ocean droplet. The application runs independently on the server, so it remains accessible to users 24/7.  
If you need to conserve resources or costs, you can:

1. Power off the droplet from the Digital Ocean dashboard when not in use  
2. Power it back on when you want to make the application available again

This approach allows you to pay only for the time the server is running, which is useful for development or demonstration purposes.

## **GitHub Integration for Future Deployments**

We encountered issues with GitHub authentication during our deployment. For future deployments, here's how to set up proper GitHub integration:

1. Generate SSH keys on your server:  
2. Copy  
3. ssh-keygen \-t ed25519 \-C "your\_email@example.com"  
4. Add the public key to your GitHub account:  
5. Copy  
6. cat \~/.ssh/id\_ed25519.pub  
7. Copy the output and add it to your GitHub account under Settings \> SSH and GPG keys.  
8. Clone your repository using SSH:  
9. Copy  
10. git clone git@github.com:jplanetx/ai-girlfriend-app.git

## **Setting Up CI/CD for the Improved Version**

For a more professional setup with continuous integration and deployment:

1. Create a GitHub Actions workflow file in your repository at `.github/workflows/deploy.yml`:  
2. Copy  
3. name: Deploy to Digital Ocean  
4. on:  
5.   push:  
6.     branches: \[ main \]  
7. jobs:  
8.   deploy:  
9.     runs-on: ubuntu-latest  
10.     steps:  
11.       \- uses: actions/checkout@v2  
12.         
13.       \- name: Set up Node.js  
14.         uses: actions/setup-node@v2  
15.         with:  
16.           node-version: '20'  
17.             
18.       \- name: Install dependencies  
19.         run: |  
20.           cd frontend  
21.           npm install  
22.           npm run build  
23.             
24.       \- name: Deploy to Digital Ocean  
25.         uses: appleboy/ssh-action@master  
26.         with:  
27.           host: ${{ secrets.HOST }}  
28.           username: ${{ secrets.USERNAME }}  
29.           key: ${{ secrets.SSH\_KEY }}  
30.           script: |  
31.             cd /var/www/ai-girlfriend  
32.             git pull  
33.             cd ai\_gf\_app/backend  
34.             npm install  
35.             pm2 restart ai-girlfriend  
36.             cd ../frontend/ai-girlfriend-frontend  
37.             npm install  
38.             npm run build  
39.             pm2 restart ai-girlfriend-frontend  
40. Set up GitHub repository secrets:  
    * `HOST`: Your server IP (64.227.7.250)  
    * `USERNAME`: Your server username (root)  
    * `SSH_KEY`: Your private SSH key  
41. Configure webhook on your server to trigger deployments on push events

This setup will automatically deploy your application whenever you push to the main branch, eliminating the need for manual deployments.

## **Next Steps for Improvement**

For the improved version of your application:

1. Set up a proper domain name for a more professional appearance  
2. Add HTTPS using Let's Encrypt for security  
3. Implement user authentication to track individual users  
4. Set up database integration for persistent storage  
5. Enhance the AI capabilities by integrating with more advanced models  
6. Add analytics to track usage and performance

With these improvements and the CI/CD pipeline in place, you'll have a robust, professional application that's easy to maintain and update.

