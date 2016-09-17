/* Copyright (c) 2015, Amperka LLC
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE.txt file for details.
 */

jQuery(function () {
    jQuery('#settings input').change(function (e) {
        var name = jQuery(this).attr('name');
        var val = jQuery(this).val();
        switch (name) {
            case 'font-size':
                jQuery('h1').css('font-size', val + 'vw');
                break;
        }
    });

    jQuery('#apply-settings').click(function (e) {
        e.preventDefault();
        jQuery('#settings').hide();
    });

    jQuery('.btn-settings').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        jQuery('#settings').toggle(0);
    });

    jQuery('#settings').click(function (e) {
        e.stopPropagation();
    });

    jQuery('body').click(function () {
        jQuery('#settings').hide();
    });

    jQuery('#settings input').each(function () {
        jQuery(this).change();
    });
});
