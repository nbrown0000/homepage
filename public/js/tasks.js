function setSelected(id) {
  const todoLists = document.getElementsByClassName('todos-list');
  for (const list of todoLists) {
    
    if(list.classList.contains('id-'+id)) {
      // match so remove hidden class
      list.classList.remove('hidden-todos')
    } else {
      // match so add hidden class
      list.classList.add('hidden-todos')
    }
  }
}