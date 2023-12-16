$('#signout-button').click(() => { 
    $.post("/api/sign-out", () => { 
        location.href = "/sign-in" 
    })
})

$('#editaccount-button').click(() => { 
    location.href = "/edit" 
})

$('#deleteaccount-button').click(() => {
    location.href = "/delete"
})

var socket = io() 

socket.emit('hello', myUsername) 


socket.on('new user', username => {
    let html = $('.home__container__users-view__list').html() 
   
    html += `
        <div class="home__container__users-view__list__user" id="user_${username}">${username}</div>
    ` 
    $('.home__container__users-view__list').html(html) 
})


socket.on('receive message', message => {
    const { username, content } = message 

    let html = $('.home__container__chat-view__chatlog').html() 
    
    html += `
        <div class="home__container__chat-view__chatlog__message">
            <strong>${username}:</strong> ${content}
        </div>
    `
    $('.home__container__chat-view__chatlog').html(html)

    $('.home__container__chat-view__chatlog')[0].scrollTop = $('.home__container__chat-view__chatlog')[0].scrollHeight 
})


socket.on('receive chatlog', messages => {
    for (let i = messages.length-1; i > 0; i--) { 
        const { username, content } = messages[i]

        
        let html = $('.home__container__chat-view__chatlog').html()
        html += `
            <div class="home__container__chat-view__chatlog__message">
                <strong>${username}:</strong> ${content}
            </div>
        `
        $('.home__container__chat-view__chatlog').html(html)
    }
})


socket.on('receive users', users => { 
    users.forEach(user => { 
        let html = $('.home__container__users-view__list').html()
        html += `
            <div class="home__container__users-view__list__user" id="user_${user}">${user}</div>
        `
        $('.home__container__users-view__list').html(html)
    })
})


socket.on('user left', username => {
    $('#user_' + username).remove() 
})

$('.home__container__chat-view__message__send').click(() => { 
    const content = $('.home__container__chat-view__message__body').val() 
    const length = content.length 

    if (length > 0 && length <= 250) { 
        socket.emit('send message', {
            username: myUsername,
            content: content
        }) 
    
        $('.home__container__chat-view__message__body').val("") 
        $('.home__container__chat-view__message__char-count').text("0/250") 
    }
})


$('.home__container__chat-view__message__body').on('keydown', e => {
    const keyCode = e.keyCode

    if (keyCode == 13) { 
        $('.home__container__chat-view__message__send').click() 
    }
})


$('.home__container__chat-view__message__body').on('input', () => {
    const length = $('.home__container__chat-view__message__body').val().length 
    $('.home__container__chat-view__message__char-count').text(length + "/250") 

    if (length > 250) { 
        $('.home__container__chat-view__message__char-count').css('color', 'red') 
        $('.home__container__chat-view__message__send').attr('disabled', true) 
    } else { 
        $('.home__container__chat-view__message__char-count').css('color', '') 
        $('.home__container__chat-view__message__send').attr('disabled', false) 
    }
})
