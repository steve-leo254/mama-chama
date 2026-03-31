import { useState, useEffect } from 'react';
import { BarChart3, Users, Clock } from 'lucide-react';
import { pollsAPI } from '../../services/api';

interface PollViewerProps {
  message: any;
}

interface PollOption {
  id: string;
  option_text: string;
  vote_count: number;
}

interface PollData {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  allow_multiple_votes: boolean;
  anonymous_voting: boolean;
  end_date?: string;
  status: string;
}

export default function PollViewer({ message }: PollViewerProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch poll data from API
  useEffect(() => {
    const fetchPollData = async () => {
      if (!message.labels?.includes('poll')) {
        setLoading(false);
        return;
      }

      try {
        // First try to use poll_id if available in message
        if (message.poll_id) {
          const poll = await pollsAPI.get(message.poll_id);
          setPollData({
            id: poll.id,
            title: poll.title,
            description: poll.description,
            options: poll.options,
            total_votes: poll.total_votes,
            allow_multiple_votes: poll.allow_multiple_votes,
            anonymous_voting: poll.anonymous_voting,
            status: poll.status,
            end_date: poll.end_date
          });
        } else {
          // Fallback: try to find poll by matching title with message subject
          const polls = await pollsAPI.list();
          const matchingPoll = polls.find(poll => 
            poll.title.toLowerCase().includes(message.subject.toLowerCase()) ||
            message.subject.toLowerCase().includes(poll.title.toLowerCase())
          );

          if (matchingPoll) {
            setPollData({
              id: matchingPoll.id,
              title: matchingPoll.title,
              description: matchingPoll.description,
              options: matchingPoll.options,
              total_votes: matchingPoll.total_votes,
              allow_multiple_votes: matchingPoll.allow_multiple_votes,
              anonymous_voting: matchingPoll.anonymous_voting,
              status: matchingPoll.status,
              end_date: matchingPoll.end_date
            });
          } else {
            // Final fallback to parsing from message if no poll found in API
            const parsedData = parsePollDataFromMessage();
            setPollData(parsedData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch poll data:', error);
        // Fallback to parsing from message
        const parsedData = parsePollDataFromMessage();
        setPollData(parsedData);
      } finally {
        setLoading(false);
      }
    };

    fetchPollData();
  }, [message]);

  // Fallback parser for message body
  const parsePollDataFromMessage = (): PollData | null => {
    if (!message.body) return null;

    try {
      const body = message.body;
      const titleMatch = body.match(/📊 New Poll: (.+?)(?:\n\n|$)/);
      const optionsMatch = body.match(/(\d+\.\s.+)(?:\n|$)/g);
      
      if (!titleMatch || !optionsMatch) return null;

      const title = titleMatch[1];
      const options = optionsMatch.map((opt: string, index: number) => ({
        id: `opt-${index}`,
        option_text: opt.replace(/^\d+\.\s/, ''),
        vote_count: 0
      }));

      return {
        id: message.id,
        title,
        description: message.subject,
        options,
        total_votes: 0,
        allow_multiple_votes: false,
        anonymous_voting: false,
        status: 'active'
      };
    } catch (error) {
      console.error('Failed to parse poll data:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pollData) return null;

  const handleOptionClick = (optionId: string) => {
    if (hasVoted || isSubmitting) return;

    if (pollData.allow_multiple_votes) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Submit vote to API
      await pollsAPI.vote(pollData.id, selectedOptions);
      
      // Refresh poll data to get updated vote counts
      const updatedPoll = await pollsAPI.get(pollData.id);
      setPollData({
        id: updatedPoll.id,
        title: updatedPoll.title,
        description: updatedPoll.description,
        options: updatedPoll.options,
        total_votes: updatedPoll.total_votes,
        allow_multiple_votes: updatedPoll.allow_multiple_votes,
        anonymous_voting: updatedPoll.anonymous_voting,
        status: updatedPoll.status,
        end_date: updatedPoll.end_date
      });
      
      setHasVoted(true);
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVotePercentage = (voteCount: number) => {
    if (pollData.total_votes === 0) return 0;
    return Math.round((voteCount / pollData.total_votes) * 100);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      {/* Poll Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
              Poll
            </span>
            {pollData.allow_multiple_votes && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                Multiple selections allowed
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {pollData.title}
          </h3>
          {pollData.description && (
            <p className="text-sm text-gray-600">{pollData.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{pollData.total_votes} votes</span>
          </div>
          {pollData.end_date && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Ends {new Date(pollData.end_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Poll Options */}
      <div className="space-y-3 mb-6">
        {pollData.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const percentage = getVotePercentage(option.vote_count);
          const isWinner = pollData.total_votes > 0 && option.vote_count === Math.max(...pollData.options.map(o => o.vote_count));

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={hasVoted || isSubmitting}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                hasVoted
                  ? isWinner
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                  : isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${hasVoted || isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    hasVoted
                      ? isWinner
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-400 bg-gray-400'
                      : isSelected
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && !hasVoted && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                    {hasVoted && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className={`font-medium ${
                    hasVoted
                      ? isWinner
                        ? 'text-green-700'
                        : 'text-gray-600'
                      : isSelected
                      ? 'text-purple-700'
                      : 'text-gray-700'
                  }`}>
                    {option.option_text}
                  </span>
                </div>
                
                {hasVoted && pollData.total_votes > 0 && (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      isWinner ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {percentage}%
                    </span>
                    <span className="text-sm text-gray-500">
                      ({option.vote_count})
                    </span>
                  </div>
                )}
              </div>
              
              {/* Progress bar for voted polls */}
              {hasVoted && pollData.total_votes > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isWinner ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Vote Button */}
      {!hasVoted && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {selectedOptions.length > 0 
              ? `${selectedOptions.length} option${selectedOptions.length > 1 ? 's' : ''} selected`
              : 'Select an option to vote'
            }
          </span>
          <button
            onClick={handleVote}
            disabled={selectedOptions.length === 0 || isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Vote'}
          </button>
        </div>
      )}

      {hasVoted && (
        <div className="text-center py-3 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-700">Your vote has been recorded</p>
        </div>
      )}
    </div>
  );
}
