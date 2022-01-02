const Discord = require('discord.js')
const client = new Discord.Client()
const express = require("express")
const app = express();
const path = require("path");
const session = require("express-session");
const ejs = require('ejs')


const MemoryStore = require("memorystore")(session);
const passport = require("passport");
const Strategy = require("passport-discord").Strategy;
const bodyParser = require("body-parser");
const db = require('quick.db')
client.on("ready", () => {
  console.log(`Ready ! , ${client.user.tag}`)
})

const listener = app.listen("8080", () => { console.log("Your app is listening on port " + listener.address().port)})


const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`); 
const templateDir = path.resolve(`${dataDir}${path.sep}templates`); 

app.use(express.static(__dirname + '/public'));

  var scopes = ["identify", "guilds"]
passport.serializeUser((user , done) => done(null , user));
passport.deserializeUser((obj , done) => done(null , obj))
passport.use(new Strategy({
  clientID: process.env.ID,
  clientSecret:process.env.sc,
  callbackURL:process.env.clb,
scope: scopes
},(accessToken , refreshToken , profile , done) => {
  process.nextTick(function(){
    return done(null , profile)
  })



}));


app.use(session({
  secret:'@#$%^&^%$#@#$%^&*&^%$#@#$&*',
  cookie:{
    maxAge:60000 * 60 * 24
  },
  resave:false,
  saveUninitialized:false,
  name:'OAuth2'
}));

app.use(passport.initialize());
app.use(passport.session()); 

app.locals.domain = process.env.domain;
app.use(express.static("public"));
const https = require('https');
const e = require("express");
app.set("view engine", "ejs");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


const pp = process.env.prefix


const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.session.backURL = req.url;
  res.redirect("/login");
}
app.get('/login', passport.authenticate('discord'));
app.get('/login/redirect' , passport.authenticate('discord') , (req , res) => {
res.redirect(process.env.domain)
});

app.get("/logout", function (req, res) {
  req.session.destroy(() => {
    req.logout();
    res.redirect("/");
  });
});

app.get('/', async function(req,res){
    const user = req.isAuthenticated() ? req.user : null;
    res.render('index.ejs',{
        user,
        client,
        
    })
})

app.get('/invite', async function(req,res){
  res.redirect("https://discord.com/api/oauth2/authorize?client_id=90031792'htt6773653515&permissions=8&scope=bot")
})

app.get('/dash',checkAuth, async function(req,res){
res.render('dash.ejs',{
    client,
    user: req.user,
 guilds: req.user.guilds.filter(u => (u.permissions & 2146958591) === 2146958591),
})
})
app.get('/prefix/:guildID', checkAuth, async function(req,res){
    const guild = client.guilds.cache.get(req.params.guildID)
    if(!guild) return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1&guild_id=${req.params.guildID}`)
        if(!client.guilds.cache.get(req.params.guildID).members.cache.get(req.user.id).hasPermission("MANAGE_GUILD")) return res.redirect('/dash');


    
    res.render('prefix.ejs',{
        guild,
        client,
    })

    

})




app.post('/prefix/:guildID', checkAuth, async function(req,res){
    const guild = client.guilds.cache.get(req.params.guildID)
    if(!guild) return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1&guild_id=${req.params.guildID}`)
if(!client.guilds.cache.get(req.params.guildID).members.cache.get(req.user.id).hasPermission("MANAGE_GUILD")) return res.redirect('/dash');
    const prefix = req.body.prefix
    if(prefix){
        
        db.set(`prefix_${guild.id}`, prefix)

    }
})


 app.get('/', (req, res) => {
		render(res, req, 'index.ejs', {
      guilds: client.guilds.cache.size,
      users: client.guilds.cache.reduce((c, g) => c + g.memberCount, 0)
    });
	});


client.login(process.env.token)
