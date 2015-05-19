var IVQV = {};

$.fn.getQuestionPerAjax = function(comment_id, player) {
	$.when(
		$.ajax({url: question_get_url + '&comment_id=' + comment_id,
				type: 'GET', dataType: 'json'})
		).then(function (array) {
			//Todo get answerd state of question also if question can be answered multiple times 
			IVQV = array;
			IVQV.player = player;
			$().buildQuestionForm();
			if(IVQV.player.isFullScreen === true)
			{
				IVQV.player.exitFullScreen();
			}
			$('#ilQuestionModal').modal('show');
		});
};

$.fn.buildQuestionForm = function() {
	var modal = $('.modal-body');
	modal.html('');
	modal.append('<h2>' + IVQV.question_title + '</h2>');
	modal.append('<p>' + IVQV.question_text + '</p>');
	if(parseInt(IVQV.type, 10) === 0)
	{
		$().addAnswerPossibilities('radio');
	}
	else
	{
		$().addAnswerPossibilities('checkbox');
	}
	$().addFeedbackDiv();
	$().addButtons();
};

$.fn.addAnswerPossibilities = function(input_type) {
	var html 	= '';
	html		= '<form id="question_form">';
	$.each(IVQV.answers, function(l,value){
		html += '<label for="answer_' + value.answer_id + '">' +
				'<input type="' + input_type + '" id="answer_' + value.answer_id + '" name="answer[]" value="' + value.answer_id + '">' +
				 value.answer + '</label><br/>';		
	});
	html		+= '<input type="hidden" name="qid" value ="' + IVQV.question_id + '"/>';
	html 		+= '</form>';
	$('.modal-body').append(html);
};

$.fn.addFeedbackDiv = function() {
	$('#question_form').append('<div class="modal_feedback"></div>');
};

$.fn.addButtons = function() {
	var question_form = $('#question_form');
	question_form.append($().createButtonButtons('sendForm',send_text));
	question_form.append($().createButtonButtons('close_form',close_text));
	$().appendButtonListener();
};

$.fn.showFeedback = function(feedback) {
	var modal = $('.modal_feedback');
	modal.html('');
	modal.html(feedback.html);
	if( feedback.is_timed == 1 )
	{
		modal.append('<div class="align_button">' + $().createButtonButtons('jumpToTimeInVideo',feedback_button_text) + '</div>');
		$('#jumpToTimeInVideo').on('click',function(e){
			$('#ilQuestionModal').modal('hide');
			$().jumpToTimeInVideo(feedback.time);
		});
	}
};

$.fn.appendButtonListener = function() {
	$('#question_form').on('submit',function(e){
		e.preventDefault();
			$().debugPrinter('IVQV Ajax', $(this).serialize());
			$.ajax({
				type     : "POST",
				cache    : false,
				url      : question_post_url,
				data     : $(this).serialize(),
				success  : function(feedback) {
					var obj = JSON.parse(feedback);
					$().showFeedback(obj);
				}
			});
	});
		
	$('#close_form').on('click',function(e){
		$('#ilQuestionModal').modal('hide');
		$().resumeVideo();
	});
};

$.fn.createButtonButtons = function(id, value) {
	return '<input id="' + id + '" class="btn btn-default btn-sm" type="submit" value="' + value + '">';
};