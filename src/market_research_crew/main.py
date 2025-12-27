#!/usr/bin/env python
import sys
import warnings

from datetime import datetime

from market_research_crew.crew import MarketResearchCrew

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# This main file is intended to be a way for you to run your
# crew locally, so refrain from adding unnecessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information

def run():
    """
    Run the crew.
    """
    inputs = {
        "product_idea": "FestPay is an AI-powered event management platform that simplifies event creation, registration, and payments in one place. It replaces manual, fragmented processes with smart automation, real-time insights, and instant digital ticketing—making events faster to launch, easier to manage, and smoother for participants."
    }

    try:
        MarketResearchCrew().crew().kickoff(inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")
