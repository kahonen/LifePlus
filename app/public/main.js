$(document).ready(function () {


  var anchor = $("#anchor").attr("value");

  var config = {
      apiKey: "AIzaSyAsIRODKOn0XwK9WoN5jOtDYJ9P5hcW0eY",
      authDomain: "test-4cce2.firebaseapp.com",
      databaseURL: "https://test-4cce2.firebaseio.com",
      projectId: "test-4cce2",
      storageBucket: "test-4cce2.appspot.com",
    };

    firebase.initializeApp(config);

    //checks if a user is logged in
    //if user is already logged in, and they are on root page, redirects to search//
    //appends user id to the menu

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $("#currentUser").text(user.uid);
        console.log(user.uid);
        getUserInfo(user.uid);
      } else {
        $("#currentUser").text("please log in");
      }
      if(user && anchor !== "1"){
        window.location.href = "/search"
      }
    });


    Number.prototype.formatMoney = function (c, d, t) {
        var n = this,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + '$' + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    console.log("hello");

    $("#signUpBtn").click(function () {
        event.preventDefault();
        console.log("sign up clicked");
        let user = {
            email: $('#emailsu').val().trim(),
            password: $('#passwordsu').val().trim(),
            name: $('#namesu').val().trim()
        }
        console.log(user);

        $.post('/api/signUpUser', user).then(function(data) {
            console.log(user.name + ' Added');
            console.log("User Id: " + data.user);

            signInUser(user.email, user.password);
        });

    });



    $("#signInBtn").click(function () {
            event.preventDefault();
            console.log("sign in clicked");
            let user = {
                email: $('#emailsi').val().trim(),
                password: $('#passwordsi').val().trim(),
            }
            console.log(user);
            signInUser(user.email, user.password);

            $.post('/api/signInUser', user).done(function(info){
              getUserInfo(info.user);
              console.log(info.user);

            })
        });

      $(".logout").click(function(){
        firebase.auth().signOut().then(function() {
          console.log('Signed Out');
        }, function(error) {
          console.error('Sign Out Error', error);
          });
      })

        function getUserInfo(id){

          let thisId = {
            id: id
          }
          $.post('/api/getUser', thisId).done(function(info) {
              console.log(info)

          });
        };

    $('#searchBtn').click(function () {

        event.preventDefault();
        console.log('Searching...');
        let autocomplete = $('#orangeForm-city').val().trim()
        let location = autocomplete.replace(', USA', '');
        let job = $('#orangeForm-job').val().trim();
        let newLife = {
            job: job,
            location: location
        }
        console.log(newLife);

        if (job === '' || location === '') {
            alert('Please fill in both items');
        } else {
            if (!$('#searchContent').hasClass('d-block')) {
                $('#searchContent').toggleClass('d-block');
            }
            post('/search/job', '/search/city', '/search/job-description', newLife);
        }
    });

    $('#saveBtn').click(function () {
        console.log("clicked");
        let jobName = $("#jobName").text();
        let salary = $("#salary").text();
        let cityName = $("#cityName").text();
        let rent = $("#rent").text();
        let id = $("#currentUser").text();

        let savedSearch = {
            id: id,
            job: jobName,
            location: cityName,
            salary: salary,
            rent: rent

        }
        console.log(savedSearch);
        toastr["success"]("Search Saved!");
        $.post('/api/savedSearches', savedSearch).done(function(data){
          console.log(data)
        });
    });


$("#accountBtn").click(function(){
    event.preventDefault();
    let id = $("#currentUser").text();

    // let idObj = {
    //   id: id
    // }

    $.get('/userInfo/' + id).done(
      window.location.replace('/userInfo/' + id)
    );
});

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function post(url1, url2, url3, data) {
        let jobPost = $.post(url1, data);
        let costsPost = $.post(url2, data);
        let descriptionPost = $.post(url3, data);

        $.when(jobPost, costsPost, descriptionPost).done(function (res1, res2, res3) {
            console.log(res1);
            console.log(res2);
            console.log(res3);
            let salary = parseFloat(res1[0].average);
            populateRent(res2[0]);
            populateUtilities(res2[0]);
            populateTransportation(res2[0]);
            populateGroceries(res2[0]);
            populateCareer(res3[0]);
            $('#jobName').text(capitalizeFirstLetter(data.job));
            $('#cityName').text(data.location);
            $('#salary').text(salary.formatMoney(0));
            console.log(data.job + ' added');;
        }).fail(function (err) {
            console.log('you fail');
            console.log(err);
        });
    }

    function populateRent(data) {
        let rentText = $('#rent-text');

        let description = 'Average rent per month for: ';
        rentText.html(description);

        $('#rent').text(data[21].average_price.formatMoney(0));
        data.forEach(element => {
            let averageRent = element.average_price.formatMoney(0);
            if (element.item_name.includes('Rent Per')) {
                rentText.append('<li>' + element.item_name.replace(', Rent Per Month', '') + ': ' + averageRent + '</li>');
            }
        });
    };

    function populateUtilities(data) {
        let utilText = $('#utilities');

        let description = 'Average Utilites per month: ';
        utilText.html(description);

        data.forEach(element => {
            let averagePay = element.average_price.formatMoney(0);
            switch (element.item_name) {
                case "Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment, Utilities (Monthly)":
                    utilText.append('<li>' + element.item_name.replace('for 85m2 Apartment, Utilities (Monthly)', '') + ': ' + averagePay + '</li>');
                    break;

                case "Internet (60 Mbps or More, Unlimited Data, Cable/ADSL), Utilities (Monthly)":
                    utilText.append('<li>' + element.item_name.replace(', Utilities (Monthly)', '') + ': ' + averagePay + '</li>');
                    break;

            }
        });
    };

    function populateTransportation(data) {
        let transText = $('#transportation');

        let description = 'Average Transportation costs per month: ';
        transText.html(description);

        data.forEach(element => {
            let averageCost = element.average_price.formatMoney(0);
            if (element.item_name.includes('Transportation')) {
                transText.append('<li>' + element.item_name.replace(', Transportation', '') + ': ' + averageCost + '</li>');
            }
        });
    };

    function populateGroceries(data) {
        let groceryText = $('#groceries');

        let description = 'Average Costs for Groceries: ';
        groceryText.html(description);

        data.forEach(element => {
            let averageCost = element.average_price.formatMoney(0);
            if (element.item_name.includes('Markets')) {
                groceryText.append('<li>' + element.item_name.replace(', Markets', '') + ': ' + averageCost + '</li>');
            }
        });
    };

    function populateCareer(data) {
        let careerText = $('#career');
        let mainTitle = $('<h4>');
        mainTitle.html(data.Purpose.OnetTitle);
        careerText.html(mainTitle);
        careerText.append('<li>' + data.Purpose.OnetDesc + '</li>');
        careerText.append('<br>' + data.Activity);
    };

    function signInUser(email, password){
        //Takes Name and Email from DOM
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(errorMessage);
          // ...
        }).then(function(){
          firebase.auth().onAuthStateChanged(function (user) {

            if (user) {
              //greet the user
              // alert("Hey " + name + "Welcome to Life Plus!")
              console.log(user.uid + "is logged in");
              // cb(user)
              //add user id, username, email to database
              var uid = user.uid;
              window.location.href = "/search"
              // User is s  igned in.
            } else {
              console.log("Login Unsuccessfull")
            }
          });



      });
    }
});
