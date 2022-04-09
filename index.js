var express = require('express');
var socket = require('socket.io');
var _ = require('lodash');

var app = express();
var server = app.listen(4000, function(){
	console.log('4000 portu dinleniyor');
});

app.use(express.static('public'));

var io = socket(server);
var kullanicilar = [];
var odalar = ['Oda 1','Oda 2','Oda 3'];
//var odalar = [
//	{name:"Oda 1",bg:"yellow"},
//	{name:"Oda 2",bg:"red"},
//	{name:"Oda 3",bg:"blue"}
//]
io.on('connection',function(socket){
	socket.emit('odalar',odalar);
	console.log('socket baglantısı kuruldu', socket.id);
	socket.on('isimgir', function(ad){
		if (_.find(kullanicilar,{kullanici:ad})||ad==null) {
			socket.emit('alert',{
				value:"Lütfen başka bir isim seçin!!!"
			})
			socket.emit('connectagain');
		} else {
    	socket.ad = ad;
    	//kullanicilar[socket.ad] = ad;
    	socket.oda = 'Oda 1';
    	kullanicilar.push({
    		kullanici:socket.ad,
    		userid:socket.id,
    		socket:socket
    	});
    	console.log('kullanicilar uzunluğu>>>>>>>>----->>>>',kullanicilar.lenghth);
    	socket.join('Oda 1');
    	socket.emit('chatguncelle', 'SERVER', 'Oda 1 e bağlandınız.');
    	socket.broadcast.to(socket.oda).emit('chatguncelle', 'SERVER', ad + ' bu odaya bağlandı.');
    	socket.emit('odaguncelle', odalar, 'Oda 1');
    	var s =_.map(kullanicilar,function(o){
    		var obj={}
			obj.name=o.kullanici;
			obj.id=o.userid;
			return obj;
		})
		io.sockets.emit('kisiguncelle', s);
		console.log('isim ve id:',s);
		console.log('socket.ad:',socket.ad);
	}
});
	//MESAJ
	socket.on('mesajgonder', function(data){
		var gelenmesaj = data.mesaj;
		console.log("asdqwe >>>>",data);
		if (gelenmesaj == "" || gelenmesaj == undefined) {
			socket.emit('alert',{
				value:"Boş mesaj atamazsın!!!"
			})
		}
		else
		{
			io.sockets.in(socket.oda).emit('chatguncelle', socket.ad, data);
		}
	});
	//ODALAR ARASINDA GEÇİŞ
	socket.on('odadegis', function(yenioda){
		socket.leave(socket.oda);	
		socket.join(yenioda);
		console.log(yenioda);
		socket.emit('chatguncelle', 'SERVER', yenioda+ ' e bağlandınız.');
		socket.broadcast.to(socket.oda).emit('chatguncelle', 'SERVER ', socket.ad+' bu odadan ayrıldı.');
		socket.oda = yenioda;
		socket.broadcast.to(yenioda).emit('chatguncelle', 'SERVER ', socket.ad+' bu odaya katıldı.');
		socket.emit('odaguncelle', odalar, yenioda);

	});
	//ÖZEL MESAJ
	socket.on('ozelmesaj', function(data){
		var a = _.find(kullanicilar,{userid:data.id});
		console.log('id datası:',data.id);
		a.socket.emit('privatemessage',{
			msj:data.msj,
			ad:socket.ad,
			id:socket.id,
			renk:data.renk
		});
		console.log('ozelmesaj icin gelen renk:',data.renk);
	});
	//DİSCONNECT
	socket.on('disconnect', function(){
		_.pullAllWith(kullanicilar, [{
			kullanici:socket.ad,
			userid:socket.id,
			socket:socket
		}], _.isEqual);

		var s =_.map(kullanicilar,function(o){
			var obj={}
			obj.name=o.kullanici;
			obj.id=o.userid;
			return obj;
		})
		console.log('kalanlar:',kullanicilar);
		io.sockets.emit('kisiguncelle', s);
		socket.broadcast.to(socket.oda).emit('chatguncelle', 'SERVER', socket.ad + ' kişisinin bağlantısı koptu');
		socket.leave(socket.oda);
	});

});
