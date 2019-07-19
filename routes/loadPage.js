const fs = require('fs');

function load_main(req, res){
    fs.readFile('./views/drone.html', (err, body)=>{
        if(err) throw err;

        res.write(body);
        res.end();
        console.log('Done : load_main()');
    });
}

module.exports = {
    main: load_main
}