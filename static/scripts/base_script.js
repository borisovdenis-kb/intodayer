/**
 * Created by Борисов on 14.03.2017.
 */

$(document).ready( function() {
   show_invitations();
});

function show_invitations() {
    $('.for_invitations').load('/get_invitations');
}