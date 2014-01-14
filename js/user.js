function User() {
  this.loggedIn = false;
  this.userName = "";
  this.password = "";
}

User.prototype.login = function (userName, password) {
  this.loggedIn = true;
  this.userName = userName;
  this.password = password;
  
  $('#loginForm').hide();
  $('#loggedInMessage').html('Welcome, ' + this.userName);
  $('#loggedInForm').show();
  
  this.loadCollections();
}

User.prototype.logout = function () {
  this.loggedIn = false;
  this.userName = "";
  this.password = "";
  
  $('#loginForm').show();
  $('#loggedInForm').hide();
}

User.prototype.getSelectedCollection = function () {
  var text = $('#loggedInCollections option:selected').text();
  var value = $('#loggedInCollections option:selected').val();
  
  return { id: value, label: text };
}

User.prototype.loadCollections = function () {
  $('#loggedInCollections').empty().append('<option selected="selected" value="-1">' + TT('[New Collection]', '[Neue Sammlung]') + '</option>');
}

User.prototype.saveCollection = function () {
  var selected = this.getSelectedCollection();
  if (selected.id == -1)
  {
    showAlert("save as new collection?");
  }
  else
  {
    showAlert("overwrite \"" + selected.label + "\"?");
  }
}

User.prototype.loadCollection = function () {
  var selected = this.getSelectedCollection();
  if (selected.id == -1)
  {
    showAlert("no collection selected");
    return;
  }
  
  showAlert("load \"" + selected.label + "\"?");
}

User.prototype.renameCollection = function () {
  var selected = this.getSelectedCollection();
  if (selected.id == -1)
  {
    showAlert("no collection selected");
    return;
  }
  
  showAlert("rename \"" + selected.label + "\"?");
}

User.prototype.deleteCollection = function () {
  var selected = this.getSelectedCollection();
  if (selected.id == -1)
  {
    showAlert("no collection selected");
    return;
  }
  
  showAlert("delete \"" + selected.label + "\"?");
}


var user = new User();
