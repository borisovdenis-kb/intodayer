$(document).ready(function () {
    setListenersEmptyPlan();
});


function setListenersEmptyPlan() {
    $('.create_plan_first').click(function () {
        createPlan();

        // TODO: тут лучше сделать проверку через сервер создалось ли расписание

        setTimeout(function () {
          window.location.href = "/plan"
        },500);

    });

}
