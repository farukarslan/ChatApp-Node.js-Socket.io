//var socket = io.connect('http://192.168.10.56:4000');
var socket = io.connect('http://localhost:4000/');

var cikti = document.getElementById('cikti'),
feedback = document.getElementById('feedback'),
mesajinput = document.getElementById('mesaj'),
pencere = document.getElementById('home'),
liste = document.getElementById('kullanicilar'),
tabmenu = document.getElementById('tabmenu'),
users = document.getElementById('users');
//ALERTTEN GİRİLİN İSMİ GÖNDER
socket.on('connect', function(ad){
	socket.emit('isimgir', prompt("İsminizi giriniz:"));
});
socket.on('connectagain', function(name){
	socket.emit('isimgir', prompt("İsminizi giriniz:"));
});
//GELEN MESAJI YAZDIR
socket.on('chatguncelle', function(ad, data){
	if (data.mesaj == "" || data.mesaj == undefined) {
		cikti.innerHTML += '<p><strong>'+ad+' : </strong>' + data + '</p>';
		window.setInterval(function() {
			pencere.scrollTop = pencere.scrollHeight;
		}, 500);
	}
	else{
		cikti.innerHTML += '<p style="color:'+data.renk+'"><strong>'+ad+' : </strong>' + data.mesaj + '</p>';
		window.setInterval(function() {
			pencere.scrollTop = pencere.scrollHeight;
		}, 500);
	}
});
//ODA LİSTESİNİ GÖSTER
socket.on('odaguncelle', function(odalar, suankioda){
	$('#odalar').empty();
	$.each(odalar, function(key, value){
		if (value == suankioda) {
			$('#odalar').append('<p style="cursor:pointer;">'+ value + '</p>');
		}
		else{
			$('#odalar').append('<p style="cursor:pointer;"  href="#" onclick="odadegis(\''+value+'\')" ><strong>'+value+'</strong></p>');
		}
	});
});
//TIKLANAN ODA İSMİNİ GÖNDER
function  odadegis(oda){
	socket.emit('odadegis', oda);
}
var kisiler= [];
//KİŞİ LİSTESİNİ GÖSTER
socket.on('kisiguncelle', function(data){
	kisiler = data;
	console.log('kisiler:',kisiler);
	$('#users').html('');
	users.innerHTML+='  ('+data.length+') &nbsp;<span style="float: right" class="glyphicon glyphicon-user"></span>'
	$('#kullanicilar').empty();
	$.each(data, function(key, value){
		$('#kullanicilar').append('<li data-toggle="tooltip" data-placement="right" title="Özelmesaj atmak için tıklayınız." class="list-group-item" href="#" style="cursor:pointer;" onclick="ozelmesaj(\''+value.id+'\',\''+value.name+'\')">'+ value.name + '<div class="yuvarlak"></div></li>');
	});
});
//TIKLANAN KİŞİ ADINI GÖNDER VE MODALI AÇ
var selecteduser;
function ozelmesaj(id,name){
	console.log('gelenobje:',id);
	selecteduser = id;
	console.log('selecteduser:',selecteduser);
	if (document.getElementById('tab'+name+'') !== null) {
		console.log('Bu kişi adına zaten bir pencere açılı!!!');	
	}
	else{
		$('.nav-tabs').append('<li class="tab'+name+'"><a  id="taba'+name+'" href="#tab'+name+'" data-toggle="tab" onclick="selectedusertab(\''+id+'\')">'+name+'<button type="button" id="close'+name+'" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></a></li>');
		$('.tab-content').append('<div class="tab-pane fade" style="height:380px;background: #f9f9f9;overflow-x:auto;overflow-y:auto;" id="tab'+name+'"><div id="cikti'+name+'"></div></div>');
		$('#tabmenu a:last').tab('show');
	}
	$('#close'+name+'').click(function(){
		$('.tab'+name+'').remove();
		$('#tab'+name+'').remove();
		$('#tabmenu a:first').tab('show');
	});
}

function selectedusertab(id){
	selecteduser=id;
	console.log('tabdan gelen userid:',selecteduser)
}
//SEÇİLEN KİŞİYE GÖNDERİLEN MESAJI YAZDIR
socket.on('privatemessage',function(data){
	//console.log(selecteduser);
	console.log('data.ad:',data.ad)
	if (document.getElementById('tab'+data.ad+'') !== null) {
		console.log('div var');
		$('#taba'+data.ad+'').addClass("bildirim");
		$('#cikti'+data.ad+'').append('<p style="color:'+data.renk+'"  ><strong style="color:#575ed8;" >'+data.ad+' :</strong>'+data.msj+'</p>');
	}
	else{
		console.log('div yok');
		$('.nav-tabs').append('<li class="tab'+data.ad+'"><a id="taba'+data.ad+'" href="#tab'+data.ad+'" data-toggle="tab">'+data.ad+'<button type="button" id="close'+data.ad+'" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></a></li>');
		$('.tab-content').append('<div class="tab-pane fade" style="height:380px;background: #f9f9f9;overflow-x:auto;overflow-y:auto;" id="tab'+data.ad+'"><div id="cikti'+data.ad+'"></div></div>');
		$('#cikti'+data.ad+'').append('<p style="color:'+data.renk+'"  ><strong style="color:#575ed8;" >'+data.ad+' :</strong>'+data.msj+'</p>');
		$('#taba'+data.ad+'').addClass("bildirim");
	}
	selecteduser=data.id;
	console.log(data);
	$('#close'+data.ad+'').click(function(){
		$('.tab'+data.ad+'').remove();
		$('#tab'+data.ad+'').remove();
		$('#tabmenu a:first').tab('show');
	});
	if ($('#tab'+data.ad+'').hasClass("active")) {
		$('#taba'+data.ad+'').removeClass("bildirim");
	}
	else{
		$('#taba'+data.ad+'').click(function(){
			console.log('bir taba tıkadınız')
			$('#taba'+data.ad+'').removeClass("bildirim");
		});
	}
})
//BOŞ MESAJ ALERTİ
socket.on('alert',function(data){
	alert(data.value);
});
$(function(){
		//TIKLANAN RENGİ BİR DEĞİŞKENE ATA
		var aktifrenk;
		$(".renk").click(function(){
			$('.renk').removeClass('aktif');
			$(this).addClass('aktif');
			aktifrenk = $(this).css('background-color');
			$('#mesaj').css('color',aktifrenk)
		});
		$('#gonder').click(function(){
			if ($('#genel').hasClass("active")) {
				console.log('genel seçili');
				var mesaj = $('#mesaj').val();
				var renk = aktifrenk;
				$('#mesaj').val('');
				socket.emit('mesajgonder', {
					mesaj:mesaj,
					renk:renk
				});
				$("#mesaj").focus();
			} else {
				console.log('genel seçili değil');
				var msj = $('#mesaj').val();
				var id = selecteduser;
				var a = _.find(kisiler,{id:selecteduser});
				console.log('aaaaa----->>>>>',a.name);
				if (msj == "" || msj == undefined) {
					alert('Boş mesaj atamazsınız.');
				}
				else{
					var renk = aktifrenk;
					$('#mesaj').val('');
					socket.emit('ozelmesaj', {
						msj,
						id,
						renk
					});
					$('#cikti'+a.name+'').append('<p style="color:'+renk+'" ><strong style="color:#575ed8" >Siz :</strong>'+msj+'</p>');
					console.log('mesaj:',msj);
					$("#mesaj").focus();
				}
			}
		});
		$('#mesaj').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#gonder').focus().click();
			}
		});
	});