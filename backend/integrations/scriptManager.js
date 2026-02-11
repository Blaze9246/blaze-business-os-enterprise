const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Script execution manager
class ScriptManager {
  constructor() {
    this.scriptsPath = '/root/.openclaw/workspace/midnight-magic';
    this.runningScripts = new Map();
  }

  // Get all available scripts
  getAvailableScripts() {
    return [
      {
        id: 'hunter-agent',
        name: 'Hunter Agent',
        description: 'Discover 10 qualified e-commerce leads with email finding',
        file: 'prospect_hunter.py',
        category: 'Lead Generation',
        schedule: 'Daily at 5:00 AM'
      },
      {
        id: 'crystal-ball',
        name: 'Crystal Ball (Lead Scoring)',
        description: 'Score and prioritize all leads (HOT/WARM/COLD/ICE)',
        file: 'blaze_crystal_ball.py',
        category: 'Lead Generation',
        schedule: 'Daily at 5:30 AM'
      },
      {
        id: 'outreach-agent',
        name: 'Outreach Agent',
        description: 'Send personalized cold emails to qualified leads',
        file: null, // Integrated into backend
        category: 'Outreach',
        schedule: 'Daily at 6:00 PM'
      },
      {
        id: 'creator-agent',
        name: 'Creator Agent',
        description: 'Generate Instagram carousel posts and captions',
        file: 'blaze_content_forge.py',
        category: 'Content',
        schedule: 'Daily at 9:00 AM'
      },
      {
        id: 'auditor-agent',
        name: 'Auditor Agent',
        description: 'Run 50+ checks on Shopify stores and generate reports',
        file: 'shopify_auditor.py',
        category: 'Audit',
        schedule: 'Manual'
      },
      {
        id: 'competitor-tracker',
        name: 'Competitor Tracker',
        description: 'Monitor competitor price changes and new products',
        file: 'blaze_competitor_tracker.py',
        category: 'Audit',
        schedule: 'Daily at 8:00 AM'
      },
      {
        id: 'proposal-forge',
        name: 'Proposal Forge',
        description: 'Generate customized proposals from audit data',
        file: 'blaze_proposal_forge.py',
        category: 'Audit',
        schedule: 'Manual'
      },
      {
        id: 'revenue-oracle',
        name: 'Revenue Oracle',
        description: 'Forecast MRR 3-6 months ahead with scenarios',
        file: 'blaze_revenue_oracle.py',
        category: 'Operations',
        schedule: 'Weekly on Monday'
      },
      {
        id: 'battle-card',
        name: 'Battle Card Generator',
        description: 'Create sales intelligence cards for all leads',
        file: 'blaze_battle_card.py',
        category: 'Lead Generation',
        schedule: 'Manual'
      },
      {
        id: 'lead-warmer',
        name: 'Lead Warmer',
        description: 'Generate value-drip email sequences',
        file: 'blaze_lead_warmer.py',
        category: 'Outreach',
        schedule: 'Manual'
      },
      {
        id: 'client-success',
        name: 'Client Success Engine',
        description: 'Generate onboarding portals and ROI reports',
        file: 'blaze_client_success.py',
        category: 'Operations',
        schedule: 'Manual'
      }
    ];
  }

  // Execute a script
  async executeScript(scriptId, params = {}) {
    const scripts = this.getAvailableScripts();
    const script = scripts.find(s => s.id === scriptId);
    
    if (!script) {
      throw new Error(`Script ${scriptId} not found`);
    }

    if (!script.file) {
      // Handle scripts that are backend-integrated
      return this.executeBackendScript(scriptId, params);
    }

    const scriptPath = path.join(this.scriptsPath, script.file);
    
    // Check if file exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script file not found: ${script.file}`);
    }

    // Generate execution ID
    const executionId = `${scriptId}-${Date.now()}`;
    
    // Build command
    let command = `cd ${this.scriptsPath} && python3 ${script.file}`;
    
    // Add params
    if (params.demo) command += ' --demo';
    if (params.export) command += ` --export ${params.export}`;
    if (params.store) command += ` --store ${params.store}`;

    // Execute
    const childProcess = exec(command, {
      timeout: 300000, // 5 minute timeout
      maxBuffer: 1024 * 1024 // 1MB output buffer
    });

    // Store process
    this.runningScripts.set(executionId, {
      process: childProcess,
      scriptId,
      startTime: Date.now(),
      output: [],
      status: 'running'
    });

    // Capture output
    childProcess.stdout.on('data', (data) => {
      const exec = this.runningScripts.get(executionId);
      if (exec) {
        exec.output.push({ type: 'stdout', data: data.toString(), time: Date.now() });
      }
    });

    childProcess.stderr.on('data', (data) => {
      const exec = this.runningScripts.get(executionId);
      if (exec) {
        exec.output.push({ type: 'stderr', data: data.toString(), time: Date.now() });
      }
    });

    childProcess.on('close', (code) => {
      const exec = this.runningScripts.get(executionId);
      if (exec) {
        exec.status = code === 0 ? 'completed' : 'failed';
        exec.endTime = Date.now();
        exec.exitCode = code;
      }
    });

    return {
      executionId,
      scriptId,
      status: 'running',
      startTime: Date.now()
    };
  }

  // Execute backend-integrated scripts
  async executeBackendScript(scriptId, params) {
    switch (scriptId) {
      case 'outreach-agent':
        return this.executeOutreachAgent(params);
      default:
        throw new Error(`Backend script ${scriptId} not implemented`);
    }
  }

  // Outreach agent logic
  async executeOutreachAgent(params) {
    // This would integrate with your email service
    return {
      executionId: `outreach-${Date.now()}`,
      scriptId: 'outreach-agent',
      status: 'completed',
      result: {
        emailsSent: 0,
        message: 'Outreach agent executed (backend integration needed)'
      }
    };
  }

  // Get execution status
  getExecutionStatus(executionId) {
    const exec = this.runningScripts.get(executionId);
    if (!exec) {
      return null;
    }

    return {
      executionId,
      scriptId: exec.scriptId,
      status: exec.status,
      startTime: exec.startTime,
      endTime: exec.endTime,
      duration: exec.endTime ? exec.endTime - exec.startTime : Date.now() - exec.startTime,
      output: exec.output.slice(-50), // Last 50 lines
      exitCode: exec.exitCode
    };
  }

  // Get all running executions
  getRunningExecutions() {
    const running = [];
    for (const [id, exec] of this.runningScripts) {
      if (exec.status === 'running') {
        running.push({
          executionId: id,
          scriptId: exec.scriptId,
          startTime: exec.startTime,
          duration: Date.now() - exec.startTime
        });
      }
    }
    return running;
  }

  // Stop execution
  stopExecution(executionId) {
    const exec = this.runningScripts.get(executionId);
    if (exec && exec.process) {
      exec.process.kill('SIGTERM');
      exec.status = 'stopped';
      exec.endTime = Date.now();
      return true;
    }
    return false;
  }
}

module.exports = ScriptManager;
