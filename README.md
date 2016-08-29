# localbin.xyz


Check out the actual website on [http://localbin.xyz]

## About

It is  a simple tool which you can use to share links with each other in a close space. You do not have to log into your email to send that URL
which you need to open in a nearby computer and print it. You just post it on this website and you can check this website on any other computer in the vicinity
of 200m and see your URL. Its sort of like pastebin combined with geolocation features.

Moreover, you can also share files which are less than 10 MB.

An important thing to note is that the website works well, if the devices are on the same wifi network. It has not been found to do well on ethernet
connections. Also, Chrome seems to have the best support as far as browsers go.

Also, when there are a lot of notes/files, the server is going to clear everything to avoid running out of memory.

This repo has all the code I used to make this website live. However, I have removed the credentials and certificates from the files.


## Frameworks/APIs used

This is a nodejs app built with Express, Mongo and Angular. For file storage, I am using Amazon S3.

## Tutorials

While building this website, I learnt a lot of things, some of which I documented in these tutorials on my blog:[blog.vksah.com]

Deploying nodejs app [https://vksah32.wordpress.com/2016/07/01/deploying-node-js-app/]

Starting HTTPS node server [https://vksah32.wordpress.com/2016/08/29/starting-a-https-node-server/]



