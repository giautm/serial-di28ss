/* Copyright (c) 2015, Amperka LLC
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE.txt file for details.
 */

jQuery(function () {
    jQuery(document).keyup(function (e) {
        switch (e.which) {
            case 122: // F11
            case 70:  // F
                jQuery('#menu .btn-fullscreen').trigger('click');
                break;
            case 121: // F10
                jQuery('#menu .btn-settings').trigger('click');
                break;
            case 67: // C
                jQuery('#menu .btn-connection').trigger('click');
                break;
            case 32: // Space
                jQuery('#connection button:visible').trigger('click');
                break;
        }
    });
});
