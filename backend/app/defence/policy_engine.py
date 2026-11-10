"""Policy engine for validating defence modes, safety boundaries, and target allowlists."""
from __future__ import annotations

import logging
from typing import List, Tuple
from .schemas import DefenceMode, DefencePolicy, ActionType
from .models import DefenceAction
from ..config import get_settings

logger = logging.getLogger("defence.policy")


class PolicyEngine:
    def __init__(self):
        settings = get_settings()
        # Default safety: OBSERVE mode
        self.mode = DefenceMode(getattr(settings, "DEFENCE_MODE", "OBSERVE").upper())
        self.emergency_disabled = False
        # Protected targets that should NEVER be blocked (management workstation, backend, DNS)
        self.protected_targets = {
            "127.0.0.1",
            "localhost",
            "0.0.0.0",
            "::1",
            "192.168.1.1",  # Typical gateway
        }
        # Lab allowlist for safe containment experimentation
        self.allowlist: List[str] = [
            "192.168.1.105",
            "192.168.1.200",
            "10.0.0.50",
            "test_user",
            "/api/v1/test",
        ]

    def set_mode(self, new_mode: DefenceMode) -> None:
        logger.info("Defence mode updated: %s -> %s", self.mode, new_mode)
        self.mode = new_mode

    def set_emergency_disabled(self, disabled: bool) -> None:
        self.emergency_disabled = disabled
        logger.warning("Emergency disable changed: %s", disabled)

    def evaluate(self, action: DefenceAction) -> Tuple[bool, str]:
        """
        Evaluate if a proposed defence action complies with current policy.
        Returns (is_allowed, reason).
        """
        if self.emergency_disabled:
            return False, "Emergency stop is active: All defence actions are halted"

        # Check protected targets
        if action.target in self.protected_targets:
            return False, f"Target '{action.target}' is protected; blocking or restricting is forbidden"

        if self.mode == DefenceMode.OBSERVE:
            # Under OBSERVE, report and propose are logged, but enforcement is forbidden
            if action.approval_required:
                return True, "Proposal permitted in OBSERVE mode (operator approval required before execution)"
            return False, "Automated enforcement is forbidden while in OBSERVE mode"

        if self.mode == DefenceMode.APPROVAL_REQUIRED:
            if not action.approval_required:
                return False, "Automated unapproved actions forbidden in APPROVAL_REQUIRED mode"
            return True, "Valid proposal: Requires human operator approval"

        if self.mode == DefenceMode.CONTROLLED_AUTOMATION:
            # Controlled automation permits only pre-allowlisted targets
            if action.target not in self.allowlist:
                return False, f"Target '{action.target}' is not in the controlled lab allowlist"
            return True, "Target in allowlist; automated execution permitted"

        return False, "Unrecognized defence mode policy"

    def get_policy(self) -> DefencePolicy:
        return DefencePolicy(
            mode=self.mode,
            allowlist=self.allowlist,
            emergency_disabled=self.emergency_disabled,
        )

