const generateMessage = (text, sender) => {
    return {
        sender,
        text,
        createdAt : new Date().getTime()
    }
}
const generateJoinMessage = (user, latitude, longitude) => {
    return {
        name: user,
        mapLink : `https://google.com/maps?q=${latitude},${longitude}`,
        joinedAt : new Date().getTime()
    }
}
module.exports = {
    generateMessage, generateJoinMessage
}