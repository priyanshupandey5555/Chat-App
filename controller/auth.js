
const { Database } = require('sqlite3')
const { open } = require('sqlite')

const bcrypt = require('bcrypt') 
const { v4: uuidv4 } = require('uuid') 

const { getUserDetails, getIdFromSession } = require('./view')


const signUp = async (req, res) => {
    
    const { username, password } = req.body

    
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    
    const usernameTaken = await db.get("SELECT * FROM users WHERE username = ?", username)

    if (usernameTaken) {
        res.status(409).end("Username already in use.") 
        return false 
    }

    const hash = await bcrypt.hash(password, 10) 

    
    await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash])
    await db.close()

    res.redirect('/sign-in') 

    return true
}


const signIn = async (req, res) => {
    
    const { username, password, rememberme: rememberMe } = req.body

    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const userRow = await db.get("SELECT id, password FROM users WHERE username = ?", username) 

    if (!userRow) { 
        res.status(401).end("Incorrect username or password.") 
        return false
    }

    const { id, password: hash } = userRow 

    await db.close()

    
    const passwordsMatch = await bcrypt.compare(password, hash) 

    if (!passwordsMatch) {
        res.status(401).end("Incorrect username or password.")
        return false
    }

    const session = await generateSession(id) 

    if (rememberMe) { 
        res.cookie('session', session, {
            httpOnly: true, 
            expires: new Date(Date.now() + 31536000000) 
        })
    } else {
        res.cookie('session', session, {
            httpOnly: true,
        }) 
    }

    res.redirect('/') 

    return true
}


const signOut = async (req, res) => {
    const session = req.cookies.session 

    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    
    await db.run("DELETE FROM sessions WHERE session = ?", session)
    await db.close()

    res.clearCookie('session') 
    res.end()
}


const generateSession = async (id) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    var session

    
    while (true) {
        session = uuidv4() 

        
        const sessionTaken = await db.get("SELECT * FROM sessions WHERE session = ?", session)

        if (!sessionTaken) { 
            break 
        }
    }

    
    await db.run("INSERT INTO sessions (id, session) VALUES (?, ?)", [id, session])
    await db.close()

    return session
}


const editAccount = async (req, res) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const { verifypassword: verifyPassword } = req.body

    const session = req.cookies.session // Get session from browser cookies

    const { id, username: oldUsername, password: oldHash } = await getUserDetails(session) 

    
    const verifyPasswordCorrect = await bcrypt.compare(verifyPassword, oldHash)

    if (!verifyPasswordCorrect) { 
        res.status(401).end("Incorrect password") 
        return false
    }
    
    
    const username = req.body.username || oldUsername
    const password = req.body.password 

    
    const usernameTaken = await db.get("SELECT * FROM users WHERE username = ?", username)

    if (usernameTaken && oldUsername !== username) { 
        res.status(409).end("Username already in use.")
        return false
    }

    var hash = await bcrypt.hash(password, 10) 

    if (!password) { 
        hash = oldHash 
    }

   
    await db.run("UPDATE users SET username = ?, password = ? WHERE id = ?", [username, hash, id])
    await db.close()

    res.redirect('/') 
    return true
}


const deleteAccount = async (req, res) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const { verifypassword: verifyPassword } = req.body 

    const session = req.cookies.session 
    const { id, password: hash } = await getUserDetails(session) 

    
    const verifyPasswordCorrect = await bcrypt.compare(verifyPassword, hash)

    if (!verifyPasswordCorrect) {
        res.status(401).end("Incorrect password")
        return false
    }

   
    await db.run("DELETE FROM users WHERE id = ?", id)
    await db.run("DELETE FROM sessions WHERE id = ?", id)
    await db.close()

    res.clearCookie('session') 
    res.redirect('/sign-in') 
    return true
}

module.exports = {
    signUp,
    signIn,
    signOut,
    editAccount,
    deleteAccount
}
