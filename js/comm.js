$(function(){

	$('#J_Scroll').iscroll();
	$('#J_ImgList').marquee();
	$('.plist-wrap').marquee({direction: 'up', speed: 30});
	$('input, textarea').placeholder();
	$(document).on('click', '#J_Notice a', function(){
		var url = $(this).attr('href');
		var d = $.dialog({
			fixed: true,
			lock: true,
			title: '校内公告',
			content: '<iframe style="width:580px;height:420px;" frameborder="0" src="'+url+'"></iframe>',
			close: function(){
				$(d).remove();
			}
		});
		return false;
	});
	
	$('#J_ReplyList').size() && CommentList.init();

	$('#J_ClassesList>ul>li:not(.all)>a').on('click', function(){
		var p = $(this).parent();
		if(p.is('.on')){ return false; }
		$('.all-on').removeClass('all-on');
		p.addClass('on').find('ul').show();
		p.siblings().removeClass('on').find('ul').hide();
		return false;
	});

	$('.myarea, .myrrt').on('click', function(){
		if(PageData.user_uin){ return; }
		Login.LoginDialog = $.dialog({
			fixed: true,
			lock: true,
			title: '登录',
			content: '<iframe style="width:300px;height:130px;" frameborder="0" src="pops/login"></iframe>',
			close: function(){
				$(d).remove();
			}
		});
		return false;
	});

	$('#J_Login').on('submit', function(){
		var _this = this;
		var n = $(_this).find('input[name=n]').val();
		var p = $(_this).find('input[name=p]').val();

		if(n.length == 0 || p.length == 0){
			$.dialog({
				fixed: true,
				lock: true,
				title: '友情提醒',
				time: 2000,
				content: '请输入您的用户名和密码，谢谢。'
			});
			return false;
		}
		var ajax = {
			url: '/login',
			type: 'GET',
			dataType: 'json',
			cache: false,
			data: { n: n, p : p, cb : (+(new Date()))},
			success: function(json, statusText) {
				if(json.state == 1){
					window.location.reload();
				}else{
					$.dialog({
						fixed: true,
						lock: true,
						title: '友情提醒',
						time: 2000,
						content: '用户名或密码错误，请重试。'
					});
					$(_this)[0].reset();
				}
			}
		};
		$.ajax(ajax);

		return false;
	});

});
var Login = {
	LoginDialog: null,
	close: function(){
		this.LoginDialog && this.LoginDialog.close();
	},
	succ: function(){
		location.href = location.href;
	}
}
var CommentList = {
	options: {
		p: 1,
		appid: 0,
		apptype: 0,
		appuserid: 0
	},
	init: function() {
		if(typeof(zpinfo) == 'undefined'){ return; }
		var _self = this;
		_self.options = $.extend(_self.options, zpinfo);
		_self.get();

		$(document).on('click', '#J_Pager a', function(){
			_self.options.p = parseInt($(this).attr('pidx'), 10);
			_self.get();
			return false;
		});
	},
	get: function() {
		var _self = this;
		var jdata = _self.options;
		var _loading = $('<img src="../imgs/loading.gif" />');

		$('#J_ReplyList').append(_loading);
		$.get('/jsons/CommentsPage?_' + (+(new Date())), jdata, function(data) {
			_loading.remove();
			$('#J_ReplyList').append(data);
			var m = $('#J_ReplyList .more');
			_self._pager(m.data('rc'), m.data('pc'), m.data('p'));
                   		m.remove();
		});
	},
	_pager: function(rc, pc, p){
		var _p = GetPager.show({
			pp: {
				RowsCount: rc,
				PageIndex: p,
				PageCount: pc,
				TotalDisplay: '共有'+rc+'条记录'
			}
		});
		$('#J_Pager').html(_p);
	}
};
var GetPager = {
	conf : {
		sp: 5
	},
	show: function(conf){
		var _self = this;
		var opts = $.extend(_self.conf, conf);
		var pp = opts.pp, sp = opts.sp;
		var s = '';
		if (pp && pp.RowsCount > 0) {
			pp.PageIndex = parseInt(pp.PageIndex, 10);
			s += '<div class="pagination">';
				s += '<div class="page-total">' + pp.TotalDisplay + '</div>';
				s += '<div class="page-inner">';
					if(pp.PageIndex > 1 && pp.PageCount > sp){
						s += '<a href="javascript:;" pidx="'+(pp.PageIndex-1)+'" class="page-prev"><span>上一页</span></a>'
					}

					if(pp.PageIndex == 1){
						s += '<span class="page-cur">1</span>'
					}else{
						s += '<a href="javascript:;" pidx="1">1</a>';
					}

					var pgmin = pp.PageIndex - parseInt(sp / 2);
					if (pgmin < 2) pgmin = 2;
					var pgmax = pp.PageIndex + parseInt(sp / 2) + sp % 2;
					if (pgmax >= pp.PageCount) { pgmax = pp.PageCount; }

					if (pgmin > 2) {
						s += ' <a href="javascript:;" pidx="' + parseInt((pgmin + 1) / 2) + '"' + (pp.PageIndex == parseInt((pgmin + 1) / 2) ? ' class="page-cur"': '') + '>...</a>';
					}
					for (var i = pgmin; i < pgmax; i++) {
						if(pp.PageIndex == i){
							s += '<span class="page-cur">'+i+'</span>'
						}else{
							s += ' <a href="javascript:;" pidx="' + i + '">' + i + '</a>';
						}
					}
					if (pgmax < pp.PageCount) {
						s += ' <a href="javascript:;" pidx="' + parseInt((pgmax + pp.PageCount) / 2) + '"' + (pp.PageIndex == parseInt((pgmax + pp.PageCount) / 2) ? ' class="page-cur"': '') + '>...</a>';
					}
					if(pp.PageIndex == pp.PageCount && pp.PageCount > 1){
						s += '<span class="page-cur">' + pp.PageCount + '</span>'
					}else{
						s += (pp.PageCount > 1 ? ' <a href="javascript:;" pidx="' + pp.PageCount + '">' + pp.PageCount + '</a>': '');
					}

					if(pp.PageIndex != pp.PageCount && pp.PageCount > sp){
						s += '<a href="javascript:;" pidx="'+(pp.PageIndex+1)+'" class="page-next"><span>下一页</span></a>'
					}
				s += '</div>';
			s += '</div>';
		}
		return s;
	}
};