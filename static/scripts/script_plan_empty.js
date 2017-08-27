$(document).ready(function () {
    setListenersEmptyPlan();
});


function setListenersEmptyPlan() {
        // для страницы empty
    $(".select_plan").click(function () {
        var this_id = $(this).attr('plan_id');
        switch_plan_only(this_id);
    });

    $('.create_plan_first').click(function () {
        createPlan();
    });
}

function switch_plan_only(select_id) {
    $.ajax({
        url: '/change_current_plan',
        type: 'POST',
        data: {plan_id: select_id},
        success: function () {
            location.href = '/plan';
        },
        error: function () {
            alert("Failed. Please update this page.");
        }
    });
}