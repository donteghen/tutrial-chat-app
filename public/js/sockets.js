let socket = io()

let form = document.getElementById('form');
let input = document.getElementById('input');
let btn = document.getElementsByTagName('button')[0]
let ul = document.getElementById('messages');
const roomtitle = document.getElementById('roomTitle');
const upperSideDiv = document.getElementById('Upper_sideDiv');
const lowerSideDiv = document.getElementById('Lower_sideDiv');
let mylocation = ''

let user = ''
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})
user = username;

const autoScroll = () => {

  // new message element
  const $newMessage = ul.lastElementChild
  
  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginButton)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // visible height
  const visibleHeight = ul.offsetHeight;

  // container height 
  const containerHeight = ul.scrollHeight;

  // current scroll position
  const offsetScroll = ul.scrollTop + visibleHeight;
  if(containerHeight - newMessageHeight <= offsetScroll) {
    ul.scrollTop = ul.scrollHeight
  }
}
async function getLocation() {
  btn.setAttribute('disabled', 'disabled')
  function success (position){
    const {latitude, longitude} = position.coords
    socket.emit('JOIN', {username, room, latitude, longitude}, (error) => {
      if(error){
        alert(error);
        location.href = '/'
      }
    })
  }
  function error (){
    window.alert('failed!');
    return;
  }
  return await navigator.geolocation?.getCurrentPosition(success, error)
}

getLocation().then(() => {
  btn.removeAttribute('disabled')
})

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if(input.value){
    socket.emit('TEXTING', input.value, (error) => {
      if(error){
        alert(error.message)
      }
    });
    input.value = '';
    input.focus()
  }
})

socket.on('ROOMINFO', ({room, allMembers}) => {
  roomtitle.innerText = `${room} Room`;
  lowerSideDiv.innerHTML = '';
  const p = document.createElement('p');
  const list = document.createElement('ul')
  list.setAttribute('id', 'users')
  allMembers.forEach(user => {
    const li = document.createElement('li');
    li.innerText = user.username;
    list.appendChild(li)
  })
  lowerSideDiv.prepend(list)
});

socket.on('JOINED', ({text, link, joinedAt}) => {
  
  const p = document.createElement('p');
  const a = document.createElement('a');
  const span = document.createElement('span')
  p.innerText = text
  p.classList = 'joinClass';
  span.innerText = moment(joinedAt).format('HH:mm');
  p.insertAdjacentElement('afterbegin', span)
  a.innerText = 'click to see location'
  a.setAttribute('href', `${link}`)
  a.setAttribute('target', '_blank');
  p.insertAdjacentElement('beforeend', a)
  upperSideDiv.prepend(p)
});

socket.on('LEFT', (msg)=> {
  const p = document.createElement('p');
  p.innerText = msg;
  p.classList.add('joinClass')
  upperSideDiv.prepend(p)
});

socket.on('TEXTED', ({sender, text, createdAt}) => {
  //console.log(sender, text, createdAt)
  const li = document.createElement('li');
  const p = document.createElement('p');
  const name = document.createElement('span');
  name.classList.add('name');
  const date = document.createElement('span');
  date.classList.add('date');
  li.innerText = text;
  name.innerText = sender === user ? 'me' : sender;
  date.innerText = moment(createdAt).format('HH:mm');
  p.appendChild(name);
  p.appendChild(date)
  li.insertAdjacentElement('afterbegin', p)
  ul.prepend(li)
})
