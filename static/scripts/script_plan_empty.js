$(document).ready(function () {
    setListenersEmptyPlan();
});


function setListenersEmptyPlan() {
        // для страницы empty
    $(".select_plan").click(function () {
        var this_id = $(this).attr('plan_id')
        switch_plan_only(this_id);
    });

    $('.create_plan_first').click(function () {
        createPlan();
    });

}

function switch_plan_only(select_id) {
    $.ajax({
        url: '/switch_plan_only_set',
        data: {'select_id': select_id},
        type: 'POST',
        dataType: 'json',
        success: function () {
            location.href = '/plan';
        },
        error: function (request) {
            // console.log(request);
            alert("Failed. Please update this page.");
        }

    });
}