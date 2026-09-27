"""Shared onboarding helpers for the functional E2E tests.

The tests in this directory exercise editing behaviour: placing nodes,
undo/redo, import and export. They are not onboarding tests, so the first-run
surfaces must not be in their way.

FossFLOW 2.5D shows two kinds of first-run surface on a fresh profile:

* the What's New release dialog, a blocking MUI Dialog shown once per version
* the side onboarding tips (Import Diagrams, Creating Connectors), which are
  fixed-position Papers anchored over parts of the toolbar

Both are dismissed here through the controls a user would click. Nothing writes
``localStorage`` directly: driving the real controls keeps these tests valid if
the storage keys or the markup change, and proves the surfaces are dismissible.
"""

import time

# Fixed-position onboarding tips, matched on the Paper that wraps them.
_TIP_MARKERS = (
    "Import Diagrams",
    "Tip: Creating Connectors",
    "Creating Connectors",
    "Connector Reroute",
    "Lasso",
)


def dismiss_onboarding_surfaces(driver, timeout=10):
    """Dismiss the What's New dialog and the side onboarding tips.

    Returns a dict with what was actually dismissed, for debugging.
    """
    result = {
        "whatsNew": dismiss_whats_new_dialog(driver, timeout),
        "tips": dismiss_onboarding_tips(driver, timeout),
    }
    return result


def dismiss_whats_new_dialog(driver, timeout=10):
    """Close the What's New release dialog by clicking its Close control."""
    deadline = time.time() + timeout
    dismissed = False

    while time.time() < deadline:
        clicked = driver.execute_script("""
            const dialog = document.querySelector('[role="dialog"]');
            if (!dialog) return false;
            // Prefer the explicit Close action in the dialog footer.
            const close = Array.from(dialog.querySelectorAll('button'))
                .find(b => /^close$/i.test((b.innerText || '').trim()));
            // Otherwise fall back to the title-bar dismiss control.
            const control = close || dialog.querySelector('button');
            if (!control) return false;
            control.click();
            return true;
        """)

        if not clicked:
            break

        dismissed = True
        time.sleep(0.4)

    settle(driver, "[role=\"dialog\"]", timeout)
    return dismissed


def dismiss_onboarding_tips(driver, timeout=10):
    """Close each onboarding tip by clicking its own dismiss control."""
    markers = json_list(_TIP_MARKERS)
    deadline = time.time() + timeout
    dismissed = 0

    while time.time() < deadline:
        clicked = driver.execute_script("""
            const markers = arguments[0];
            let n = 0;
            document.querySelectorAll('.MuiPaper-root').forEach(paper => {
                const text = (paper.innerText || '').trim();
                if (!markers.some(m => text.startsWith(m))) return;
                // The tip's dismiss control is an icon button with no label.
                Array.from(paper.querySelectorAll('button')).forEach(b => {
                    if (!(b.innerText || '').trim()) { b.click(); n++; }
                });
            });
            return n;
        """, markers)

        if not clicked:
            break

        dismissed += clicked
        time.sleep(0.3)

    return dismissed


def json_list(values):
    """Pass a Python list to execute_script as a real JS array."""
    return list(values)


def settle(driver, selector, timeout=10):
    """Block until nothing matches the selector any more."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        remaining = driver.execute_script(
            "const s = arguments[0]; return document.querySelectorAll(s).length;", selector
        )
        if not remaining:
            return True
        time.sleep(0.2)
    return False
