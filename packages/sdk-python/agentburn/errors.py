"""Errors raised by the AgentBurn SDK."""


class AgentBurnError(RuntimeError):
    """Deterministic failure (client error, malformed response). Not retried."""
