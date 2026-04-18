from crewai import Agent, Crew, Process, Task,LLM
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from crewai_tools import SerperDevTool,ScrapeWebsiteTool
from dotenv import load_dotenv
import os

load_dotenv()

#create the tools for the agents
web_search_tool = SerperDevTool()
web_scraping_tool = ScrapeWebsiteTool()
# selenium_scraping_tool = SeleniumScrapingTool()


toolkit = [web_search_tool, web_scraping_tool]

#define the LLM
llm = LLM(
    model="gemini-2.5-flash-lite",
    api_key=os.getenv("GOOGLE_API_KEY"),
    provider="google"
)


#define the crew class
@CrewBase
class MarketResearchCrew():
    """MarketResearchCrew crew"""

    agents: List[BaseAgent]
    tasks: List[Task]
    
    #define the path for configuration files
    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"
    
    # ========== Agents ============ #
    
    @agent
    def market_research_Specialist(self) -> Agent:
        return Agent(
            config=self.agents_config["market_research_Specialist"],
            tools=toolkit,  
            llm=llm  
        )
    @agent
    def competitive_intelligence_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["competitive_intelligence_analyst"],
            tools=toolkit,
            llm=llm
        )
    @agent
    def customer_insights_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config["customer_insights_researcher"],          
            tools=toolkit,
            llm=llm
        )
    @agent
    def product_strategy_advisor(self) -> Agent:
        return Agent(
            config=self.agents_config["product_strategy_advisor"],
            tools=toolkit,
            llm=llm           
        )
    @agent
    def business_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["business_analyst"],  
            tools=toolkit,
            llm=llm
        )
        
        
        
    # =================== Tasks ================#
    
    @task
    def market_research_task(self) -> Task:
        return Task(
            config=self.tasks_config["market_research_task"]
        )
        
    @task
    def competitive_intelligence_task(self) -> Task:
        return Task(
            config=self.tasks_config["competitive_intelligence_task"],
            context = [self.market_research_task()]
        )
        
    @task
    def customer_insights_task(self) -> Task:
        return Task(
            config=self.tasks_config["customer_insights_task"],
            context = [self.market_research_task(),
                       self.competitive_intelligence_task()]
        )
        
    @task
    def product_strategy_task(self) -> Task:
        return Task(
            config=self.tasks_config["product_strategy_task"],
            context = [self.market_research_task(),
                       self.competitive_intelligence_task(),
                       self.customer_insights_task()]
        )
        
    @task
    def business_analyst_task(self) -> Task:
        return Task(
            config=self.tasks_config["business_analyst_task"],
            context = [self.market_research_task(),
                       self.competitive_intelligence_task(),
                       self.customer_insights_task(),
                       self.product_strategy_task()],
            output_file="report/market_research_report.md"
        )
        
    # =============== Crew =================#
    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            llm=llm
        )