from importlib.metadata import version

import typer

app = typer.Typer(no_args_is_help=True, help="calibar eval harness.")


@app.callback()
def main() -> None:
    """calibar eval harness."""


@app.command("version")
def show_version() -> None:
    """Print the calibar-eval version."""
    typer.echo(version("calibar-eval"))
