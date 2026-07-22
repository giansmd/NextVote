import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class VotingService {
  private readonly logger = new Logger(VotingService.name);

  constructor(private configService: ConfigService) {}

  private get apiUrl(): string {
    return this.configService.get<string>('API_URL') || 'http://localhost:3000/api';
  }

  async getActiveElection(token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${this.apiUrl}/elections`, { headers });
      const elections = res.data || [];
      return elections.find((e: any) => e.status === 'ACTIVE') || elections[0] || null;
    } catch (error: any) {
      this.logger.error('Error fetching elections:', error?.response?.data || error.message);
      return null;
    }
  }

  async getCandidates(query?: string): Promise<{ id: string; fullName: string; listNumber: string; politicalMovement: string }[]> {
    try {
      const activeElection = await this.getActiveElection();
      if (!activeElection) return [];

      const res = await axios.get(`${this.apiUrl}/candidates/election/${activeElection.id}`);
      const candidates = res.data || [];

      if (query) {
        const q = query.toLowerCase();
        return candidates.filter((c: any) =>
          c.fullName.toLowerCase().includes(q) ||
          (c.politicalMovement && c.politicalMovement.toLowerCase().includes(q)) ||
          c.listNumber.includes(q)
        );
      }
      return candidates;
    } catch (error: any) {
      this.logger.error('Error fetching candidates:', error?.response?.data || error.message);
      return [];
    }
  }

  async castVote(email: string, password: string, candidateId: string): Promise<string> {
    try {
      // 1. Authenticate user
      const authRes = await axios.post(`${this.apiUrl}/auth/login`, { email, password });
      const jwtToken = authRes.data?.token;

      if (!jwtToken) {
        throw new Error('Credenciales inválidas. Verifique su correo y contraseña.');
      }

      // 2. Obtain active election
      const activeElection = await this.getActiveElection(jwtToken);
      if (!activeElection || activeElection.status !== 'ACTIVE') {
        return '❌ **No hay elecciones activas** en este momento para emitir un voto.';
      }

      // 3. Request anonymous credential token
      const credRes = await axios.get(`${this.apiUrl}/voting/${activeElection.id}/credential`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const token = credRes.data?.token;

      if (!token) {
        throw new Error('No se pudo emitir la credencial anónima de votación.');
      }

      // 4. Submit anonymous vote to the blockchain
      const submitRes = await axios.post(`${this.apiUrl}/voting/submit`, {
        electionId: activeElection.id,
        candidateId,
        token
      });

      const blockHash = submitRes.data?.blockHash || 'Registrado';

      return `✅ **¡Voto Registrado Exitosamente en la Blockchain!**\n\n` +
             `🔒 **Hash del Bloque:** \`${blockHash}\`\n` +
             `🏛️ **Elección:** ${activeElection.name}\n` +
             `🛡️ **Seguridad:** Su identidad se ha desacoplado criptográficamente del voto para garantizar el anonimato total.`;
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || error?.response?.data?.message || error.message;
      this.logger.error('Error in castVote:', errMsg);
      throw new Error(errMsg);
    }
  }

  async getResults(): Promise<string> {
    try {
      const activeElection = await this.getActiveElection();
      if (!activeElection) {
        return '❌ No hay información de elecciones activas.';
      }

      const res = await axios.get(`${this.apiUrl}/blockchain/${activeElection.id}/results`);
      const { candidates, summary } = res.data;

      let msg = `📊 **Resultados en Tiempo Real - ${activeElection.name}**\n\n`;
      msg += `🔹 **Puntos totales ponderados:** ${summary?.totalWeightedVotes || 0}\n\n`;

      if (candidates && candidates.length > 0) {
        candidates.forEach((c: any) => {
          msg += `• **${c.fullName}** (Lista ${c.listNumber}): **${c.weightedVotes} puntos** (${c.rawVotes} votos directos)\n`;
        });
      } else {
        msg += 'Aún no hay votos registrados.';
      }

      return msg;
    } catch (error: any) {
      return '❌ Error al consultar los resultados de la blockchain.';
    }
  }

  async verifyIntegrity(): Promise<string> {
    try {
      const activeElection = await this.getActiveElection();
      if (!activeElection) {
        return '❌ No hay elecciones activas para verificar.';
      }

      const res = await axios.get(`${this.apiUrl}/blockchain/${activeElection.id}/verify`);
      const { isValid, stats, message } = res.data;

      if (isValid) {
        return `🛡️ **Cadena de Bloques Íntegra y Verificada**\n\n` +
               `✅ **Mensaje:** ${message}\n` +
               `📦 **Bloques Totales:** ${stats.totalBlocks} (${stats.realBlocks} votos reales + ${stats.dummyBlocks} bloques de ruido/dummy)`;
      } else {
        return `⚠️ **ALERTA DE INTEGRIDAD EN LA BLOCKCHAIN**\n\n` +
               `Se han detectado inconsistencias o manipulaciones en los hashes de la cadena.`;
      }
    } catch (error: any) {
      return '❌ Error al verificar la integridad de la cadena de bloques.';
    }
  }
}
